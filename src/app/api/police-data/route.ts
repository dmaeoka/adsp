// src/app/api/police-data/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://data.police.uk/api";
const FORCE_ID = "metropolitan";

// Simple in-memory cache (in production, use Redis or similar)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CORS headers
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");
		const force = searchParams.get("force") || FORCE_ID;

		if (!date) {
			return NextResponse.json(
				{ error: "Date parameter is required (format: YYYY-MM)" },
				{ status: 400, headers: corsHeaders },
			);
		}

		// Validate date format
		const dateRegex = /^\d{4}-\d{2}$/;
		if (!dateRegex.test(date)) {
			return NextResponse.json(
				{ error: "Invalid date format. Use YYYY-MM" },
				{ status: 400, headers: corsHeaders },
			);
		}

		const cacheKey = `${force}-${date}`;

		// Check cache first
		const cached = cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			console.log(`Cache hit for ${cacheKey}`);
			return NextResponse.json(cached.data, { headers: corsHeaders });
		}

		// Fetch from external API
		const externalUrl = `${API_BASE_URL}/stops-force?force=${force}&date=${date}`;
		console.log(`Fetching data from: ${externalUrl}`);

		const response = await fetch(externalUrl, {
			headers: {
				"User-Agent": "ADSP-Interview-Task/1.0",
				Accept: "application/json",
			},
			// Add timeout
			signal: AbortSignal.timeout(30000), // 30 seconds timeout
		});

		if (!response.ok) {
			console.error(
				`External API error: ${response.status} ${response.statusText}`,
			);

			// Return more specific error messages
			if (response.status === 404) {
				return NextResponse.json(
					{
						error: "No data available for the specified date and force",
						data: [],
						month: date,
					},
					{ status: 200, headers: corsHeaders },
				);
			}

			if (response.status === 429) {
				return NextResponse.json(
					{ error: "Rate limit exceeded. Please try again later." },
					{ status: 429, headers: corsHeaders },
				);
			}

			return NextResponse.json(
				{ error: `External API error: ${response.status}` },
				{ status: 502, headers: corsHeaders },
			);
		}

		const data: unknown[] = await response.json();

		// Validate response data
		if (!Array.isArray(data)) {
			console.error("Invalid response format from external API");
			return NextResponse.json(
				{ error: "Invalid response format from external API" },
				{ status: 502, headers: corsHeaders },
			);
		}

		const result = {
			data,
			month: date,
			total: data.length,
			fetched_at: new Date().toISOString(),
		};

		// Cache the response
		cache.set(cacheKey, { data: result, timestamp: Date.now() });

		// Clean up old cache entries periodically
		if (cache.size > 100) {
			const now = Date.now();
			for (const [key, entry] of Array.from(cache.entries())) {
				if (now - entry.timestamp > CACHE_DURATION) {
					cache.delete(key);
				}
			}
		}

		console.log(`Successfully fetched ${data.length} records for ${date}`);

		return NextResponse.json(result, {
			headers: {
				...corsHeaders,
				"Cache-Control": "public, max-age=300", // 5 minutes browser cache
			},
		});
	} catch (error) {
		console.error("API route error:", error);

		// Handle different types of errors
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				return NextResponse.json(
					{
						error: "Request timeout. The external API took too long to respond.",
					},
					{ status: 504, headers: corsHeaders },
				);
			}

			if (error.message.includes("fetch")) {
				return NextResponse.json(
					{
						error: "Failed to connect to external API. Please check your internet connection.",
					},
					{ status: 503, headers: corsHeaders },
				);
			}
		}

		return NextResponse.json(
			{
				error: "Internal server error",
				message:
					process.env.NODE_ENV === "development"
						? error instanceof Error
							? error.message
							: "Unknown error"
						: undefined,
			},
			{ status: 500, headers: corsHeaders },
		);
	}
}

// Health check endpoint
export async function POST(request: NextRequest) {
	try {
		const body: { action?: string } = await request.json();

		if (body.action === "health-check") {
			return NextResponse.json(
				{
					status: "healthy",
					cache_size: cache.size,
					uptime: process.uptime(),
					timestamp: new Date().toISOString(),
				},
				{ headers: corsHeaders },
			);
		}

		if (body.action === "clear-cache") {
			cache.clear();
			return NextResponse.json(
				{ message: "Cache cleared successfully" },
				{ headers: corsHeaders },
			);
		}

		return NextResponse.json(
			{ error: "Invalid action" },
			{ status: 400, headers: corsHeaders },
		);
	} catch (error) {
		console.error("POST request error:", error);
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400, headers: corsHeaders },
		);
	}
}
