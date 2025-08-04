import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

interface StatsCardProps {
	title: string;
	value: string;
	trend?: "success" | "error" | "warning" | "info";
	trendValue?: string;
	icon?: React.ReactNode;
}

const StatsCard = ({ title, value, trend, trendValue, icon }: StatsCardProps) => {
	const getTrendColor = () => {
		switch (trend) {
			case "success":
				return "success";
			case "error":
				return "error";
			case "warning":
				return "warning";
			case "info":
			default:
				return "primary";
		}
	};

	const getTrendIcon = () => {
		switch (trend) {
			case "success":
				return <IconTrendingUp size={16} />;
			case "error":
				return <IconTrendingDown size={16} />;
			case "warning":
				return <IconMinus size={16} />;
			case "info":
			default:
				return <IconTrendingUp size={16} />;
		}
	};

	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
					<Typography variant="h6" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
						{title}
					</Typography>
					{icon && (
						<Box sx={{ opacity: 0.7 }}>
							{icon}
						</Box>
					)}
				</Box>

				<Typography variant="h4" component="div" fontWeight="600" mb={1}>
					{value}
				</Typography>

				{trendValue && (
					<Box display="flex" alignItems="center">
						<Chip
							icon={getTrendIcon()}
							label={trendValue}
							color={getTrendColor()}
							size="small"
							variant="outlined"
							sx={{ fontSize: "0.75rem" }}
						/>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

export default StatsCard;
