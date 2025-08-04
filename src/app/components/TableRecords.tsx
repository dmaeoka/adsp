import React, { useState, useMemo } from "react";
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Chip,
	TablePagination,
	TextField,
	InputAdornment,
	Stack,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@mui/material";
import {
	IconSearch,
	IconSortAscending,
	IconSortDescending,
} from "@tabler/icons-react";
import DashboardCard from "./DashboardCard";

interface StopSearchRecord {
	id?: string;
	datetime: string;
	type: string;
	location?: {
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

interface TableRecordsProps {
	data: StopSearchRecord[];
	forceName: string;
	month: string;
}

const TableRecords = ({ data, forceName, month }: TableRecordsProps) => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] =
		useState<keyof StopSearchRecord>("datetime");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Filter and sort data
	const processedData = useMemo(() => {
		let filtered = data;

		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase();
			filtered = data.filter(
				(record) =>
					record.location?.street?.name
						?.toLowerCase()
						.includes(searchLower) ||
					record.type.toLowerCase().includes(searchLower) ||
					record.outcome?.toLowerCase().includes(searchLower) ||
					record.object_of_search
						?.toLowerCase()
						.includes(searchLower) ||
					record.age_range?.toLowerCase().includes(searchLower) ||
					record.gender?.toLowerCase().includes(searchLower) ||
					record.self_defined_ethnicity
						?.toLowerCase()
						.includes(searchLower),
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue: any = a[sortField];
			let bValue: any = b[sortField];

			// Handle date sorting
			if (sortField === "datetime") {
				aValue = new Date(aValue as string).getTime();
				bValue = new Date(bValue as string).getTime();
			}

			// Handle string sorting
			if (typeof aValue === "string") {
				aValue = aValue?.toLowerCase() || "";
				bValue = (bValue as string)?.toLowerCase() || "";
			}

			// Handle null values
			if (aValue === null || aValue === undefined) aValue = "";
			if (bValue === null || bValue === undefined) bValue = "";

			if (sortDirection === "asc") {
				return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
			} else {
				return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
			}
		});

		return filtered;
	}, [data, searchTerm, sortField, sortDirection]);

	// Paginate data
	const paginatedData = processedData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSort = (field: keyof StopSearchRecord) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
		setPage(0);
	};

	const getSortIcon = (field: keyof StopSearchRecord) => {
		if (sortField !== field) return null;
		return sortDirection === "asc" ? (
			<IconSortAscending size={16} />
		) : (
			<IconSortDescending size={16} />
		);
	};

	const getOutcomeColor = (outcome: string | null | undefined) => {
		if (!outcome) return "default";
		const outcomeLower = outcome.toLowerCase();
		if (outcomeLower.includes("arrest")) return "error";
		if (outcomeLower.includes("no further action")) return "success";
		if (
			outcomeLower.includes("caution") ||
			outcomeLower.includes("warning")
		)
			return "warning";
		return "default";
	};

	// Show empty state if no data
	if (!data || data.length === 0) {
		return (
			<DashboardCard title={`Stop & Search Records - ${forceName}`}>
				<Typography
					variant="body2"
					color="text.secondary"
					textAlign="center"
					py={4}
				>
					No records available for {month}
				</Typography>
			</DashboardCard>
		);
	}

	return (
		<DashboardCard title={`Stop & Search Records - ${forceName}`}>
			{/* Search and Controls */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				mb={2}
				alignItems="center"
			>
				<TextField
					size="small"
					placeholder="Search records..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setPage(0);
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<IconSearch size={20} />
							</InputAdornment>
						),
					}}
					sx={{ minWidth: 250 }}
				/>

				<FormControl size="small" sx={{ minWidth: 120 }}>
					<InputLabel>Sort by</InputLabel>
					<Select
						value={sortField}
						label="Sort by"
						onChange={(e) =>
							handleSort(e.target.value as keyof StopSearchRecord)
						}
					>
						<MenuItem value="datetime">Date</MenuItem>
						<MenuItem value="type">Type</MenuItem>
						<MenuItem value="age_range">Age</MenuItem>
						<MenuItem value="gender">Gender</MenuItem>
						<MenuItem value="outcome">Outcome</MenuItem>
					</Select>
				</FormControl>

				<Typography variant="body2" color="text.secondary">
					{processedData.length.toLocaleString()} of{" "}
					{data.length.toLocaleString()} records
				</Typography>
			</Stack>

			{/* Table */}
			<Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
				<Table
					aria-label="police records table"
					sx={{
						whiteSpace: "nowrap",
						mt: 2,
					}}
				>
					<TableHead>
						<TableRow>
							<TableCell>#</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("datetime")}
							>
								<Box display="flex" alignItems="center" gap={1}>
									<Typography
										variant="subtitle2"
										fontWeight={600}
									>
										Date
									</Typography>
									{getSortIcon("datetime")}
								</Box>
							</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("type")}
							>
								<Box display="flex" alignItems="center" gap={1}>
									<Typography
										variant="subtitle2"
										fontWeight={600}
									>
										Type
									</Typography>
									{getSortIcon("type")}
								</Box>
							</TableCell>
							<TableCell>
								<Typography
									variant="subtitle2"
									fontWeight={600}
								>
									Location
								</Typography>
							</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("age_range")}
							>
								<Box display="flex" alignItems="center" gap={1}>
									<Typography
										variant="subtitle2"
										fontWeight={600}
									>
										Age
									</Typography>
									{getSortIcon("age_range")}
								</Box>
							</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("gender")}
							>
								<Box display="flex" alignItems="center" gap={1}>
									<Typography
										variant="subtitle2"
										fontWeight={600}
									>
										Gender
									</Typography>
									{getSortIcon("gender")}
								</Box>
							</TableCell>
							<TableCell
								sx={{ cursor: "pointer" }}
								onClick={() => handleSort("outcome")}
							>
								<Box display="flex" alignItems="center" gap={1}>
									<Typography
										variant="subtitle2"
										fontWeight={600}
									>
										Outcome
									</Typography>
									{getSortIcon("outcome")}
								</Box>
							</TableCell>
							<TableCell>
								<Typography
									variant="subtitle2"
									fontWeight={600}
								>
									Object of Search
								</Typography>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedData.length > 0 ? (
							paginatedData.map((record, index) => (
								<TableRow
									key={
										record.id ||
										`${page * rowsPerPage + index}`
									}
									hover
								>
									<TableCell>
										<Typography
											sx={{
												fontSize: "15px",
												fontWeight: "500",
											}}
										>
											{page * rowsPerPage + index + 1}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="subtitle2"
											fontWeight={400}
										>
											{new Date(
												record.datetime,
											).toLocaleDateString("en-GB")}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											sx={{ px: "4px" }}
											size="small"
											label={record.type}
											color="primary"
											variant="outlined"
										/>
									</TableCell>
									<TableCell>
										<Typography
											color="textSecondary"
											variant="subtitle2"
											fontWeight={400}
											sx={{
												maxWidth: 200,
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
											title={
												record.location?.street?.name ||
												"Unknown"
											}
										>
											{record.location?.street?.name ||
												"Unknown"}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="subtitle2"
											fontWeight={400}
										>
											{record.age_range ||
												"Not specified"}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="subtitle2"
											fontWeight={400}
										>
											{record.gender || "Not specified"}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											sx={{ px: "4px" }}
											size="small"
											label={record.outcome || "Unknown"}
											color={getOutcomeColor(
												record.outcome,
											)}
											variant="outlined"
										/>
									</TableCell>
									<TableCell>
										<Typography
											color="textSecondary"
											variant="subtitle2"
											fontWeight={400}
											sx={{
												maxWidth: 150,
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
											title={
												record.object_of_search ||
												"Not specified"
											}
										>
											{record.object_of_search ||
												"Not specified"}
										</Typography>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={8} align="center">
									<Typography
										variant="body2"
										color="text.secondary"
										py={4}
									>
										{searchTerm
											? `No records found matching "${searchTerm}"`
											: "No records found"}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Box>

			{/* Pagination */}
			{processedData.length > 0 && (
				<TablePagination
					rowsPerPageOptions={[5, 10, 25, 50, 100]}
					component="div"
					count={processedData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					sx={{ mt: 2 }}
				/>
			)}
		</DashboardCard>
	);
};

export default TableRecords;
