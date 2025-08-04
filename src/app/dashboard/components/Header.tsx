// src/app/dashboard/components/Header.tsx
import React, { useState, useEffect } from "react";
import {
	Box,
	AppBar,
	Toolbar,
	styled,
	IconButton,
	Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { usePathname, useSearchParams } from "next/navigation";
import { IconMenu } from "@tabler/icons-react";

interface ItemType {
	toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [selectedMonth, setSelectedMonth] = useState("");

	// Parse current values from URL
	useEffect(() => {
		const pathParts = pathname.split("/");
		const monthFromParams = searchParams.get("date") || "";

		setSelectedMonth(monthFromParams);
	}, [pathname, searchParams]);

	// Fetch police forces
	const getFormattedMonth = () => {
		if (!selectedMonth) return "No month selected";
		try {
			const date = new Date(selectedMonth + "-01");
			return date.toLocaleDateString("en-GB", {
				year: "numeric",
				month: "long",
			});
		} catch {
			return selectedMonth;
		}
	};

	const AppBarStyled = styled(AppBar)(({ theme }) => ({
		boxShadow: "none",
		background: theme.palette.background.paper,
		justifyContent: "center",
		backdropFilter: "blur(4px)",
		[theme.breakpoints.up("lg")]: {
			minHeight: "70px",
		},
	}));

	const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
		width: "100%",
		color: theme.palette.text.secondary,
	}));

	return (
		<AppBarStyled position="sticky" color="default">
			<ToolbarStyled>
				<IconButton
					color="inherit"
					aria-label="menu"
					onClick={toggleMobileSidebar}
					sx={{
						display: {
							lg: "none",
							xs: "inline",
						},
					}}
				>
					<IconMenu width="20" height="20" />
				</IconButton>

				<Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, ml: { lg: 0, xs: 1 } }}>
					<Typography
						variant="h3"
						component="div"
						sx={{
							display: { xs: 'none', sm: 'block' },
							fontWeight: 600,
							color: 'text.primary'
						}}
					>
						Police Stop & Search Dashboard - {getFormattedMonth()}
					</Typography>
				</Box>
			</ToolbarStyled>
		</AppBarStyled>
	);
};

Header.propTypes = {
	sx: PropTypes.object,
};

export default Header;
