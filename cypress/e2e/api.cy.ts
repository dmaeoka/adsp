// cypress/e2e/api.cy.ts
describe("Police Data API", () => {
	const API_BASE = "/api/police-data";

	describe("GET /api/police-data", () => {
		it("should return police data with valid parameters", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan&date=2024-01`,
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property("data");
				expect(response.body).to.have.property("month", "2024-01");
				expect(response.body).to.have.property("total");
				expect(response.body).to.have.property("fetched_at");
				expect(response.body.data).to.be.an("array");
			});
		});

		it("should return 400 for missing date parameter", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan`,
				failOnStatusCode: false,
			}).then((response) => {
				expect(response.status).to.eq(400);
				expect(response.body).to.have.property("error");
				expect(response.body.error).to.include(
					"Date parameter is required",
				);
			});
		});

		it("should return 400 for invalid date format", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan&date=invalid-date`,
				failOnStatusCode: false,
			}).then((response) => {
				expect(response.status).to.eq(400);
				expect(response.body).to.have.property("error");
				expect(response.body.error).to.include("Invalid date format");
			});
		});

		it("should use default force when not specified", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?date=2024-01`,
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property("data");
			});
		});

		it("should handle different police forces", () => {
			const forces = ["metropolitan", "city-of-london", "surrey"];

			forces.forEach((force) => {
				cy.request({
					method: "GET",
					url: `${API_BASE}?force=${force}&date=2024-01`,
				}).then((response) => {
					expect(response.status).to.eq(200);
					expect(response.body).to.have.property("data");
				});
			});
		});

		it("should return CORS headers", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan&date=2024-01`,
			}).then((response) => {
				expect(response.headers).to.have.property(
					"access-control-allow-origin",
					"*",
				);
				expect(response.headers).to.have.property(
					"access-control-allow-methods",
				);
				expect(response.headers).to.have.property(
					"access-control-allow-headers",
				);
			});
		});

		it("should cache responses", () => {
			const url = `${API_BASE}?force=metropolitan&date=2024-01`;

			// First request
			cy.request(url).then((response1) => {
				expect(response1.status).to.eq(200);

				// Second request should be faster due to caching
				const startTime = Date.now();
				cy.request(url).then((response2) => {
					const endTime = Date.now();
					expect(response2.status).to.eq(200);
					expect(response2.body).to.deep.equal(response1.body);

					// Should be significantly faster (cached)
					expect(endTime - startTime).to.be.lessThan(1000);
				});
			});
		});

		it("should handle rate limiting gracefully", () => {
			// This test would need to be adjusted based on actual rate limiting implementation
			const requests = Array.from({ length: 10 }, () =>
				cy.request({
					method: "GET",
					url: `${API_BASE}?force=metropolitan&date=2024-01`,
					failOnStatusCode: false,
				}),
			);

			// All requests should either succeed or return appropriate rate limit errors
			cy.wrap(requests).each((request: any) => {
				cy.wrap(request).then((response) => {
					expect([200, 429]).to.include(response.status);
				});
			});
		});
	});

	describe("POST /api/police-data", () => {
		it("should handle health check requests", () => {
			cy.request({
				method: "POST",
				url: API_BASE,
				body: { action: "health-check" },
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property("status", "healthy");
				expect(response.body).to.have.property("cache_size");
				expect(response.body).to.have.property("uptime");
				expect(response.body).to.have.property("timestamp");
			});
		});

		it("should handle cache clear requests", () => {
			cy.request({
				method: "POST",
				url: API_BASE,
				body: { action: "clear-cache" },
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property(
					"message",
					"Cache cleared successfully",
				);
			});
		});

		it("should return 400 for invalid actions", () => {
			cy.request({
				method: "POST",
				url: API_BASE,
				body: { action: "invalid-action" },
				failOnStatusCode: false,
			}).then((response) => {
				expect(response.status).to.eq(400);
				expect(response.body).to.have.property(
					"error",
					"Invalid action",
				);
			});
		});

		it("should return 400 for invalid request body", () => {
			cy.request({
				method: "POST",
				url: API_BASE,
				body: "invalid-json",
				failOnStatusCode: false,
				headers: {
					"Content-Type": "application/json",
				},
			}).then((response) => {
				expect(response.status).to.eq(400);
				expect(response.body).to.have.property(
					"error",
					"Invalid request body",
				);
			});
		});
	});

	describe("OPTIONS /api/police-data", () => {
		it("should handle preflight requests", () => {
			cy.request({
				method: "OPTIONS",
				url: API_BASE,
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.headers).to.have.property(
					"access-control-allow-origin",
					"*",
				);
				expect(response.headers).to.have.property(
					"access-control-allow-methods",
				);
				expect(response.headers).to.have.property(
					"access-control-allow-headers",
				);
			});
		});
	});

	describe("Error Scenarios", () => {
		it("should handle external API failures gracefully", () => {
			// This would require mocking the external API to return errors
			// For now, we'll test with an invalid date that might cause issues
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan&date=1900-01`,
				failOnStatusCode: false,
			}).then((response) => {
				// Should either succeed with empty data or return appropriate error
				expect([200, 404, 502]).to.include(response.status);

				if (response.status === 200) {
					expect(response.body).to.have.property("data");
					expect(response.body.data).to.be.an("array");
				} else {
					expect(response.body).to.have.property("error");
				}
			});
		});

		it("should handle timeout scenarios", () => {
			// This test would need special setup to simulate timeouts
			// For demonstration purposes, testing with edge case parameters
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=nonexistent&date=2024-01`,
				failOnStatusCode: false,
				timeout: 30000,
			}).then((response) => {
				// Should handle gracefully, either with empty data or appropriate error
				expect(response.status).to.be.oneOf([200, 404, 502, 504]);
			});
		});
	});

	describe("Data Validation", () => {
		it("should return properly formatted data", () => {
			cy.request({
				method: "GET",
				url: `${API_BASE}?force=metropolitan&date=2024-01`,
			}).then((response) => {
				expect(response.status).to.eq(200);

				const { data } = response.body;
				if (data.length > 0) {
					const record = data[0];

					// Check required fields
					expect(record).to.have.property("datetime");
					expect(record).to.have.property("type");
					expect(record).to.have.property("location");

					// Check data types
					expect(record.datetime).to.be.a("string");
					expect(record.type).to.be.a("string");
					expect(record.location).to.be.an("object");

					// Check date format
					expect(new Date(record.datetime).toString()).to.not.equal(
						"Invalid Date",
					);
				}
			});
		});

		it("should handle different date ranges", () => {
			const dates = ["2024-01", "2023-12", "2023-01"];

			dates.forEach((date) => {
				cy.request({
					method: "GET",
					url: `${API_BASE}?force=metropolitan&date=${date}`,
				}).then((response) => {
					expect(response.status).to.eq(200);
					expect(response.body).to.have.property("month", date);
					expect(response.body.data).to.be.an("array");
				});
			});
		});
	});
});
