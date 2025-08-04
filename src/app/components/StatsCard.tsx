import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from "@tabler/icons-react";

interface StatsCardProps {
	title: string;
	value: string;
	trend?: "success" | "error" | "warning" | "info";
	trendValue?: string;
	icon?: React.ReactNode;
}

const StatsCard = ({ title, value }: StatsCardProps) => {
	return (
		<Card sx={{ height: "100%" }} elevation={9} variant={undefined}>
			<CardContent>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					mb={2}
				>
					<Typography
						variant="h6"
						color="text.secondary"
						sx={{ fontSize: "0.875rem" }}
					>
						{title}
					</Typography>
				</Box>

				<Typography
					variant="h4"
					component="div"
					fontWeight="600"
					mb={1}
				>
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default StatsCard;
