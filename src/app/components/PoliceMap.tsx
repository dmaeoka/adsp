// src/app/components/PoliceMap.tsx
"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import { LatLngTuple, DivIcon, LatLngBounds, LatLng } from "leaflet";
import { Typography, Chip, Box, Stack, Slider, FormControlLabel, Switch } from "@mui/material";
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

// Custom clustering algorithm
const clusterMarkers = (markers: ProcessedMarker[], clusterRadius: number, searchTypeColors: Record<string, string>): (ProcessedMarker | ClusterPoint)[] => {
	if (markers.length === 0) return [];

	const processed = new Set<number>();
	const result: (ProcessedMarker | ClusterPoint)[] = [];

	markers.forEach((marker, index) => {
		if (processed.has(index)) return;

		const nearbyMarkers = [marker];
		const markerLatLng = new LatLng(marker.lat, marker.lng);

		// Find nearby markers within cluster radius
		markers.forEach((otherMarker, otherIndex) => {
			if (index === otherIndex || processed.has(otherIndex)) return;

			const otherLatLng = new LatLng(otherMarker.lat, otherMarker.lng);
			const distance = markerLatLng.distanceTo(otherLatLng);

			if (distance <= clusterRadius) {
				nearbyMarkers.push(otherMarker);
				processed.add(otherIndex);
			}
		});

		processed.add(index);

		// If we have multiple markers, create a cluster
		if (nearbyMarkers.length > 1) {
			// Calculate cluster center
			const avgLat = nearbyMarkers.reduce((sum, m) => sum + m.lat, 0) / nearbyMarkers.length;
			const avgLng = nearbyMarkers.reduce((sum, m) => sum + m.lng, 0) / nearbyMarkers.length;

			// Determine dominant search type for cluster color
			const typeCounts = nearbyMarkers.reduce((acc, m) => {
				acc[m.type] = (acc[m.type] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			const dominantType = Object.entries(typeCounts)
				.sort(([,a], [,b]) => b - a)[0][0];

			const cluster: ClusterPoint = {
				id: `cluster-${avgLat}-${avgLng}`,
				lat: avgLat,
				lng: avgLng,
				markers: nearbyMarkers,
				searchType: dominantType,
				color: searchTypeColors[dominantType] || '#3388ff',
				count: nearbyMarkers.length,
				// Required fields for interface compatibility
				datetime: nearbyMarkers[0].datetime,
				type: `Cluster (${nearbyMarkers.length})`,
				location: {
					latitude: avgLat.toString(),
					longitude: avgLng.toString(),
					street: { name: `${nearbyMarkers.length} locations` }
				}
			};

			result.push(cluster);
		} else {
			result.push(marker);
		}
	});

	return result;
};

// Custom cluster icon creation
const createClusterIcon = (cluster: ClusterPoint) => {
	return new DivIcon({
		html: `
			<div style="
				background-color: ${cluster.color};
				color: white;
				border-radius: 50%;
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 3px solid white;
				box-shadow: 0 2px 5px rgba(0,0,0,0.3);
				font-weight: bold;
				font-size: 14px;
			">
				${cluster.count}
			</div>
		`,
		className: 'custom-cluster-icon',
		iconSize: [40, 40],
		iconAnchor: [20, 20]
	});
};

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
const getOutcomeColor = (outcome: string | null | undefined): 'error' | 'success' | 'warning' | 'default' => {
	if (!outcome) return 'default';
	const outcomeLower = outcome.toLowerCase();
	if (outcomeLower.includes('arrest')) return 'error';
	if (outcomeLower.includes('no further action')) return 'success';
	if (outcomeLower.includes('caution') || outcomeLower.includes('warning')) return 'warning';
	return 'default';
};

export default function PoliceMap({ data = [], forceName, month }: PoliceMapProps) {
	const mapRef = useRef<any>(null);
	const [clusterRadius, setClusterRadius] = useState(100); // meters
	const [showClusters, setShowClusters] = useState(true);

	// Color mapping for different search types
	const searchTypeColors = useMemo(() => {
		const colors = [
			'#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
			'#DDA0DD', '#98D8C8', '#FF8C42', '#6C5CE7', '#A8E6CF'
		];

		const uniqueTypes = Array.from(new Set(data.map(record => record.type)))
		const colorMap: Record<string, string> = {};

		uniqueTypes.forEach((type, index) => {
			colorMap[type] = colors[index % colors.length];
		});

		return colorMap;
	}, [data]);

	// Process data to extract valid coordinates
	const validMarkers = useMemo(() => {
		return data
			.filter(record => {
				const lat = record.location?.latitude;
				const lng = record.location?.longitude;
				return lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
			})
			.map(record => ({
				...record,
				lat: parseFloat(record.location!.latitude!),
				lng: parseFloat(record.location!.longitude!),
			}));
	}, [data]);

	// Apply clustering
	const displayMarkers = useMemo(() => {
		if (!showClusters || validMarkers.length === 0) {
			return validMarkers;
		}
		return clusterMarkers(validMarkers, clusterRadius, searchTypeColors);
	}, [validMarkers, clusterRadius, showClusters, searchTypeColors]);

	// Calculate map bounds
	const mapBounds = useMemo(() => {
		if (validMarkers.length === 0) return null;

		const lats = validMarkers.map(marker => marker.lat);
		const lngs = validMarkers.map(marker => marker.lng);

		const bounds = new LatLngBounds(
			[Math.min(...lats), Math.min(...lngs)],
			[Math.max(...lats), Math.max(...lngs)]
		);

		return bounds;
	}, [validMarkers]);

	// Default center (London)
	const defaultCenter: LatLngTuple = [51.505, -0.09];
	const center = validMarkers.length > 0 && mapBounds
		? mapBounds.getCenter()
		: defaultCenter;

	// Statistics for the legend
	const stats = useMemo(() => {
		const typeCount = validMarkers.reduce((acc, marker) => {
			acc[marker.type] = (acc[marker.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(typeCount)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5); // Show top 5 types
	}, [validMarkers]);

	// Helper function to check if item is a cluster
	const isCluster = (item: ProcessedMarker | ClusterPoint): item is ClusterPoint => {
		return 'markers' in item;
	};

	const cardTitle = forceName && month
		? `Stop & Search Locations - ${month}`
		: 'Stop & Search Locations';

	return (
		<DashboardCard title={cardTitle}>
			<Box sx={{ height: 500, width: '100%', position: 'relative' }}>
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
						<Box
							sx={{
								position: 'absolute',
								top: 10,
								left: 10,
								backgroundColor: 'white',
								p: 2,
								borderRadius: 1,
								boxShadow: 2,
								zIndex: 1000,
								minWidth: 200
							}}
						>
							<FormControlLabel
								control={
									<Switch
										checked={showClusters}
										onChange={(e) => setShowClusters(e.target.checked)}
										size="small"
									/>
								}
								label="Enable Clustering"
							/>

							{showClusters && (
								<Box sx={{ mt: 1 }}>
									<Typography variant="caption" gutterBottom>
										Cluster Radius: {clusterRadius}m
									</Typography>
									<Slider
										value={clusterRadius}
										onChange={(_, value) => setClusterRadius(value as number)}
										min={50}
										max={500}
										step={25}
										size="small"
									/>
								</Box>
							)}
						</Box>
						<MapContainer
							ref={mapRef}
							center={center}
							zoom={validMarkers.length === 1 ? 16 : 13}
							scrollWheelZoom={true}
							style={{ height: '100%', width: '100%', borderRadius: '8px' }}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url='https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'
							/>

							<MapBounds bounds={mapBounds} />

							{displayMarkers.map((item, index) => {
								if (isCluster(item)) {
									// Render cluster
									const position: LatLngTuple = [item.lat, item.lng];
									return (
										<Marker
											key={`cluster-${index}`}
											position={position}
											icon={createClusterIcon(item)}
										>
											<Popup maxWidth={350}>
												<Stack spacing={1}>
													<Typography variant="subtitle1" fontWeight={600}>
														Cluster of {item.count} Records
													</Typography>

													<Typography variant="body2">
														<strong>Dominant Type:</strong> {item.searchType}
													</Typography>

													{/* Show breakdown of types in cluster */}
													<Box>
														<Typography variant="body2" fontWeight={600}>
															Search Types:
														</Typography>
														{Object.entries(
															item.markers.reduce((acc, m) => {
																acc[m.type] = (acc[m.type] || 0) + 1;
																return acc;
															}, {} as Record<string, number>)
														).map(([type, count]) => (
															<Typography key={type} variant="caption" display="block">
																• {type}: {count}
															</Typography>
														))}
													</Box>

													{/* Show date range */}
													<Typography variant="body2">
														<strong>Date Range:</strong>{' '}
														{new Date(Math.min(...item.markers.map(m => new Date(m.datetime).getTime()))).toLocaleDateString('en-GB')}
														{' - '}
														{new Date(Math.max(...item.markers.map(m => new Date(m.datetime).getTime()))).toLocaleDateString('en-GB')}
													</Typography>
												</Stack>
											</Popup>
										</Marker>
									);
								} else {
									// Render individual marker
									const position: LatLngTuple = [item.lat, item.lng];
									const searchTypeColor = searchTypeColors[item.type] || '#3388ff';

									return (
										<CircleMarker
											key={item.id || `marker-${index}`}
											center={position}
											radius={8}
											pathOptions={{
												fillColor: searchTypeColor,
												fillOpacity: 0.8,
												color: 'white',
												weight: 2
											}}
										>
											<Popup maxWidth={300}>
												<Stack spacing={1}>
													<Typography variant="subtitle1" fontWeight={600}>
														Stop & Search Record
													</Typography>

													<Stack direction="row" spacing={1} alignItems="center">
														<Typography variant="body2">
															<strong>Type:</strong>
														</Typography>
														<Chip
															size="small"
															label={item.type}
															sx={{
																backgroundColor: searchTypeColor,
																color: 'white',
																fontSize: '0.75rem'
															}}
														/>
													</Stack>

													<Typography variant="body2">
														<strong>Date:</strong> {new Date(item.datetime).toLocaleDateString('en-GB')}
													</Typography>

													<Typography variant="body2">
														<strong>Location:</strong> {item.location?.street?.name || 'Unknown'}
													</Typography>

													{item.age_range && (
														<Typography variant="body2">
															<strong>Age Range:</strong> {item.age_range}
														</Typography>
													)}

													{item.gender && (
														<Typography variant="body2">
															<strong>Gender:</strong> {item.gender}
														</Typography>
													)}

													{item.outcome && (
														<Stack direction="row" spacing={1} alignItems="center">
															<Typography variant="body2">
																<strong>Outcome:</strong>
															</Typography>
															<Chip
																size="small"
																label={item.outcome}
																color={getOutcomeColor(item.outcome)}
																variant="outlined"
															/>
														</Stack>
													)}

													{item.object_of_search && (
														<Typography variant="body2">
															<strong>Object of Search:</strong> {item.object_of_search}
														</Typography>
													)}
												</Stack>
											</Popup>
										</CircleMarker>
									);
								}
							})}
						</MapContainer>
						{stats.length > 0 && (
							<Box
								sx={{
									position: 'absolute',
									top: 10,
									right: 10,
									backgroundColor: 'white',
									p: 1.5,
									borderRadius: 1,
									boxShadow: 2,
									zIndex: 1000,
									maxWidth: 200
								}}
								data-testid="map-legend"
							>
								<Typography variant="subtitle2" fontWeight={600} mb={1}>
									Search Types
								</Typography>
								<Stack spacing={0.5}>
									{stats.map(([type, count]) => (
										<Stack key={type} direction="row" spacing={1} alignItems="center">
											<Box
												sx={{
													width: 12,
													height: 12,
													borderRadius: '50%',
													backgroundColor: searchTypeColors[type],
													flexShrink: 0
												}}
											/>
											<Typography
												variant="caption"
												sx={{
													fontSize: '0.7rem',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													flex: 1
												}}
												title={type}
											>
												{type}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{count}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Box>
						)}
						<Box
							sx={{
								position: 'absolute',
								bottom: 10,
								left: 10,
								backgroundColor: 'rgba(255, 255, 255, 0.9)',
								p: 1,
								borderRadius: 1,
								zIndex: 1000
							}}
						>
							<Typography variant="caption" color="text.secondary">
								Showing {showClusters ? displayMarkers.length : validMarkers.length} {showClusters && displayMarkers.length !== validMarkers.length ? 'records' : 'locations'}
							</Typography>
						</Box>
					</>
				)}
			</Box>
		</DashboardCard>
	);
}
