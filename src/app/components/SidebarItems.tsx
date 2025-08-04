// src/app//components/SidebarItems.tsx
import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
	Box,
	Select,
	FormControl,
	InputLabel,
	MenuItem as MUI_MenuItem,
	CircularProgress,
	Typography,
	Divider
} from "@mui/material";
import {
	Logo,
	Sidebar as MUI_Sidebar,
} from "react-mui-sidebar";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PoliceForce {
	id: string;
	name: string;
}

// Separate component that uses useSearchParams
function SidebarContent() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	// State for forces and selections
	const [forces, setForces] = useState<PoliceForce[]>([]);
	const [isLoadingForces, setIsLoadingForces] = useState(true);
	const [selectedForce, setSelectedForce] = useState("");
	const [selectedMonth, setSelectedMonth] = useState("");

	// Parse current values from URL
	useEffect(() => {
		const pathParts = pathname.split("/");
		const forceFromPath = pathParts[2] || "metropolitan";
		const monthFromParams = searchParams.get("date") || "";

		setSelectedForce(forceFromPath);
		setSelectedMonth(monthFromParams);
	}, [pathname, searchParams]);

	// Fetch police forces
	useEffect(() => {
		const fetchForces = async () => {
			try {
				setIsLoadingForces(true);
				const response = await fetch("https://data.police.uk/api/forces");

				if (!response.ok) {
					throw new Error(`Failed to fetch forces: ${response.status}`);
				}

				const forcesData: PoliceForce[] = await response.json();
				const sortedForces = forcesData
					.map((force) => ({
						id: force.id,
						name: force.name,
					}))
					.sort((a: PoliceForce, b: PoliceForce) =>
						a.name.localeCompare(b.name),
					);

				setForces(sortedForces);
			} catch (err) {
				console.error("Error fetching forces:", err);
				setForces([
					{ id: "metropolitan", name: "Metropolitan Police Service" },
				]);
			} finally {
				setIsLoadingForces(false);
			}
		};

		fetchForces();
	}, []);

	const generateMonthOptions = () => {
		const options = [];
		const now = new Date();
		now.setMonth(now.getMonth() - 3);
		for (let i = 0; i < 24; i++) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
			const displayStr = date.toLocaleDateString("en-GB", {
				year: "numeric",
				month: "long",
			});
			options.push({ value: monthStr, label: displayStr });
		}
		return options;
	};

	const monthOptions = generateMonthOptions();

	// Update URL with new parameters
	const updateURL = useCallback((force: string, month: string) => {
		const newPath = `/${force}`;
		const queryParams = new URLSearchParams();

		if (month) queryParams.set("date", month);

		// Preserve other search params
		const currentPage = searchParams.get("page");
		const currentLimit = searchParams.get("limit");
		const currentSort = searchParams.get("sort");
		const currentSortBy = searchParams.get("sortBy");
		const currentSearch = searchParams.get("search");

		if (currentPage && currentPage !== "1") queryParams.set("page", currentPage);
		if (currentLimit && currentLimit !== "10") queryParams.set("limit", currentLimit);
		if (currentSort && currentSort !== "desc") queryParams.set("sort", currentSort);
		if (currentSortBy && currentSortBy !== "datetime") queryParams.set("sortBy", currentSortBy);
		if (currentSearch) queryParams.set("search", currentSearch);

		const queryString = queryParams.toString();
		const fullPath = queryString ? `${newPath}?${queryString}` : newPath;

		router.push(fullPath, { scroll: false });
	}, [router, searchParams]);

	const handleForceChange = (event: any) => {
		const newForce = event.target.value;
		setSelectedForce(newForce);
		updateURL(newForce, selectedMonth);
	};

	const handleMonthChange = useCallback((event: any) => {
		const newMonth = typeof event === 'string' ? event : event.target.value;
		setSelectedMonth(newMonth);
		updateURL(selectedForce, newMonth);
	}, [selectedForce, updateURL]);

	// Auto-set default month if none selected
	useEffect(() => {
		if (!selectedMonth && !isLoadingForces) {
			const now = new Date();
			now.setMonth(now.getMonth() - 3);
			const defaultMonth = now.toISOString().slice(0, 7);
			setSelectedMonth(defaultMonth);
			handleMonthChange(defaultMonth);
		}
	}, [isLoadingForces, selectedMonth, handleMonthChange]);

	return (
		<>
			{/* Controls Section */}
			<Box px={3} py={2}>
				<Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
					Filters
				</Typography>

				{/* Police Force Selector */}
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id="force-select-label">Police Force</InputLabel>
					<Select
						labelId="force-select-label"
						id="force-select"
						value={selectedForce}
						label="Police Force"
						onChange={handleForceChange}
						disabled={isLoadingForces}
					>
						{isLoadingForces ? (
							<MUI_MenuItem disabled>
								<Box display="flex" alignItems="center" gap={1}>
									<CircularProgress size={16} />
									Loading forces...
								</Box>
							</MUI_MenuItem>
						) : (
							forces.map((force) => (
								<MUI_MenuItem key={force.id} value={force.id}>
									{force.name}
								</MUI_MenuItem>
							))
						)}
					</Select>
				</FormControl>

				{/* Month Selector */}
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id="month-select-label">Month</InputLabel>
					<Select
						labelId="month-select-label"
						id="month-select"
						value={selectedMonth}
						label="Month"
						onChange={handleMonthChange}
					>
						{monthOptions.map((option) => (
							<MUI_MenuItem key={option.value} value={option.value}>
								{option.label}
							</MUI_MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</>
	);
}

// Loading fallback component
function SidebarFallback() {
	return (
		<Box px={3} py={2}>
			<Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
				Filters
			</Typography>

			{/* Loading placeholders */}
			<FormControl fullWidth sx={{ mb: 2 }}>
				<InputLabel id="force-select-label">Police Force</InputLabel>
				<Select
					labelId="force-select-label"
					disabled
					value=""
					label="Police Force"
				>
					<MUI_MenuItem disabled>
						<Box display="flex" alignItems="center" gap={1}>
							<CircularProgress size={16} />
							Loading...
						</Box>
					</MUI_MenuItem>
				</Select>
			</FormControl>

			<FormControl fullWidth sx={{ mb: 2 }}>
				<InputLabel id="month-select-label">Month</InputLabel>
				<Select
					labelId="month-select-label"
					disabled
					value=""
					label="Month"
				>
					<MUI_MenuItem disabled>
						<Box display="flex" alignItems="center" gap={1}>
							<CircularProgress size={16} />
							Loading...
						</Box>
					</MUI_MenuItem>
				</Select>
			</FormControl>
		</Box>
	);
}

// Main SidebarItems component with Suspense wrapper
const SidebarItems = () => {
	return (
		<MUI_Sidebar
			width={"100%"}
			showProfile={false}
			themeColor={"#5D87FF"}
			themeSecondaryColor={"#49beff"}
		>
			<Logo img="/images/logos/dark-logo.svg" component={Link} to="/">
				Police Dashboard
			</Logo>

			<Suspense fallback={<SidebarFallback />}>
				<SidebarContent />
			</Suspense>
		</MUI_Sidebar>
	);
};

export default SidebarItems;
