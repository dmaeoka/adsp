// src/app/components/PoliceMap.tsx
"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	CircleMarker,
} from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { LatLngTuple, DivIcon, LatLngBounds, LatLng } from "leaflet";
import {
	Typography,
	Chip,
	Box,
	Stack,
} from "@mui/material";
import DashboardCard from "./DashboardCard";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface StopSearchRecord {
	id?: string;
	datetime: string;
	type: string;
	location?: {
		latitude?: string;
		longitude?: string;
		street?: {
			name?: string;
		};
	};
	age_range?: string | null;
	gender?: string | null;
	outcome?: string | null;
	object_of_search?: string | null;
	self_defined_ethnicity?: string | null;
}

interface PoliceMapProps {
	data?: StopSearchRecord[];
	forceName?: string;
	month?: string;
}

interface ProcessedMarker extends StopSearchRecord {
	lat: number;
	lng: number;
}

interface ClusterPoint {
	id: string;
	lat: number;
	lng: number;
	markers: ProcessedMarker[];
	searchType: string;
	color: string;
	count: number;
	datetime: string;
	type: string;
	location?: {
		latitude?: string;
		longitude?: string;
		street?: {
			name?: string;
		};
	};
	age_range?: string | null;
	gender?: string | null;
	outcome?: string | null;
	object_of_search?: string | null;
	self_defined_ethnicity?: string | null;
}

// Component to fit map bounds to markers
const MapBounds: React.FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
	const map = useMap();

	useEffect(() => {
		if (bounds && bounds.isValid()) {
			map.fitBounds(bounds, { padding: [20, 20] });
		}
	}, [map, bounds]);

	return null;
};

// Outcome color mapping
const getOutcomeColor = (
	outcome: string | null | undefined,
): "error" | "success" | "warning" | "default" => {
	if (!outcome) return "default";
	const outcomeLower = outcome.toLowerCase();
	if (outcomeLower.includes("arrest")) return "error";
	if (outcomeLower.includes("no further action")) return "success";
	if (outcomeLower.includes("caution") || outcomeLower.includes("warning"))
		return "warning";
	return "default";
};

export default function PoliceMap({
	data = [],
	forceName,
	month,
}: PoliceMapProps) {
	const mapRef = useRef<any>(null);

	// Color mapping for different search types
	const searchTypeColors = useMemo(() => {
		const colors = [
			"#FF6B6B",
			"#4ECDC4",
			"#45B7D1",
			"#96CEB4",
			"#FFEAA7",
			"#DDA0DD",
			"#98D8C8",
			"#FF8C42",
			"#6C5CE7",
			"#A8E6CF",
		];

		const uniqueTypes = Array.from(
			new Set(data.map((record) => record.type)),
		);
		const colorMap: Record<string, string> = {};

		uniqueTypes.forEach((type, index) => {
			colorMap[type] = colors[index % colors.length];
		});

		return colorMap;
	}, [data]);

	// Process data to extract valid coordinates
	const validMarkers = useMemo(() => {
		return data
			.filter((record) => {
				const lat = record.location?.latitude;
				const lng = record.location?.longitude;
				return (
					lat &&
					lng &&
					!isNaN(parseFloat(lat)) &&
					!isNaN(parseFloat(lng))
				);
			})
			.map((record) => ({
				...record,
				lat: parseFloat(record.location!.latitude!),
				lng: parseFloat(record.location!.longitude!),
			}));
	}, [data]);

	// Calculate map bounds
	const mapBounds = useMemo(() => {
		if (validMarkers.length === 0) return null;
		const lats = validMarkers.map((marker) => marker.lat);
		const lngs = validMarkers.map((marker) => marker.lng);
		const bounds = new LatLngBounds(
			[Math.min(...lats), Math.min(...lngs)],
			[Math.max(...lats), Math.max(...lngs)],
		);

		return bounds;
	}, [validMarkers]);

	// Default center (London)
	const defaultCenter: LatLngTuple = [51.505, -0.09];
	const center =
		validMarkers.length > 0 && mapBounds
			? mapBounds.getCenter()
			: defaultCenter;

	// Statistics for the legend
	const stats = useMemo(() => {
		const typeCount = validMarkers.reduce(
			(acc, marker) => {
				acc[marker.type] = (acc[marker.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		return Object.entries(typeCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5); // Show top 5 types
	}, [validMarkers]);

	const cardTitle =
		forceName && month
			? `Stop & Search Locations - ${month}`
			: "Stop & Search Locations";

	return (
		<DashboardCard title={cardTitle}>
			<Box sx={{ height: 500, width: "100%", position: "relative" }}>
				{validMarkers.length === 0 ? (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						height="100%"
						bgcolor="grey.100"
						borderRadius={1}
					>
						<Typography variant="body1" color="text.secondary">
							No location data available for the selected period
						</Typography>
					</Box>
				) : (
					<>
						<MapContainer
							ref={mapRef}
							center={center}
							zoom={validMarkers.length === 1 ? 16 : 13}
							scrollWheelZoom={true}
							style={{
								height: "100%",
								width: "100%",
								borderRadius: "8px",
							}}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>

							<MapBounds bounds={mapBounds} />

							<MarkerClusterGroup>
								{validMarkers.map((item, index) => {
									// Render individual marker
									const position: LatLngTuple = [
										item.lat,
										item.lng,
									];
									const searchTypeColor = searchTypeColors[item.type] || "#3388ff";
									return (
										<CircleMarker
											key={item.id || `marker-${index}`}
											center={position}
											radius={8}
											pathOptions={{
												fillColor: searchTypeColor,
												fillOpacity: 0.8,
												color: "white",
												weight: 2,
											}}
										>
											<Popup maxWidth={300}>
												<Stack spacing={1}>
													<Typography
														variant="subtitle1"
														fontWeight={600}
													>
														Stop & Search Record
													</Typography>

													<Stack
														direction="row"
														spacing={1}
														alignItems="center"
													>
														<Typography variant="body2">
															<strong>
																Type:
															</strong>
														</Typography>
														<Chip
															size="small"
															label={item.type}
															sx={{
																backgroundColor:
																	searchTypeColor,
																color: "white",
																fontSize:
																	"0.75rem",
															}}
														/>
													</Stack>

													<Typography variant="body2">
														<strong>Date:</strong>{" "}
														{new Date(
															item.datetime,
														).toLocaleDateString(
															"en-GB",
														)}
													</Typography>

													<Typography variant="body2">
														<strong>
															Location:
														</strong>{" "}
														{item.location?.street
															?.name || "Unknown"}
													</Typography>

													{item.age_range && (
														<Typography variant="body2">
															<strong>
																Age Range:
															</strong>{" "}
															{item.age_range}
														</Typography>
													)}

													{item.gender && (
														<Typography variant="body2">
															<strong>
																Gender:
															</strong>{" "}
															{item.gender}
														</Typography>
													)}

													{item.outcome && (
														<Stack
															direction="row"
															spacing={1}
															alignItems="center"
														>
															<Typography variant="body2">
																<strong>
																	Outcome:
																</strong>
															</Typography>
															<Chip
																size="small"
																label={
																	item.outcome
																}
																color={getOutcomeColor(
																	item.outcome,
																)}
																variant="outlined"
															/>
														</Stack>
													)}

													{item.object_of_search && (
														<Typography variant="body2">
															<strong>
																Object of
																Search:
															</strong>{" "}
															{
																item.object_of_search
															}
														</Typography>
													)}
												</Stack>
											</Popup>
										</CircleMarker>
									);
								})}
							</MarkerClusterGroup>

						</MapContainer>
						{stats.length > 0 && (
							<Box
								id="map-legend"
								sx={{
									position: "absolute",
									top: 10,
									right: 10,
									backgroundColor: "white",
									p: 1.5,
									borderRadius: 1,
									boxShadow: 2,
									zIndex: 1000,
									maxWidth: 200,
								}}
							>
								<Typography
									variant="subtitle2"
									fontWeight={600}
									mb={1}
								>
									Search Types
								</Typography>
								<Stack spacing={0.5}>
									{stats.map(([type, count]) => (
										<Stack
											key={type}
											direction="row"
											spacing={1}
											alignItems="center"
										>
											<Box
												sx={{
													width: 12,
													height: 12,
													borderRadius: "50%",
													backgroundColor:
														searchTypeColors[type],
													flexShrink: 0,
												}}
											/>
											<Typography
												variant="caption"
												sx={{
													fontSize: "0.7rem",
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
													flex: 1,
												}}
												title={type}
											>
												{type}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{count}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Box>
						)}
					</>
				)}
			</Box>
		</DashboardCard>
	);
}
