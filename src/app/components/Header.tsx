// src/app/components/Header.tsx
import React, { useState, useEffect, Suspense } from "react";
import {
	Box,
	AppBar,
	Toolbar,
	styled,
	IconButton,
	Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { IconMenu } from "@tabler/icons-react";
import { usePoliceForce } from "../contexts/PoliceForceContext";

interface ItemType {
	toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

// Separate component that uses useSearchParams and context
function HeaderContent({ toggleMobileSidebar }: ItemType) {
	const { getCurrentForceName } = usePoliceForce();

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
		<AppBarStyled position="sticky" color="default" id="header">
			<ToolbarStyled>
				<IconButton
					id="mobile-menu-button"
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

				<Box
					sx={{
						flexGrow: 1,
						display: "flex",
						alignItems: "center",
						gap: 2,
						ml: { lg: 0, xs: 1 },
					}}
				>
					<Typography
						variant="h3"
						component="div"
						sx={{
							display: { xs: "none", sm: "block" },
							fontWeight: 600,
							color: "text.primary",
						}}
					>
						Police Stop & Search Dashboard - {getCurrentForceName()}
					</Typography>
				</Box>
			</ToolbarStyled>
		</AppBarStyled>
	);
}

// Loading fallback component
function HeaderFallback({ toggleMobileSidebar }: ItemType) {
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

				<Box
					sx={{
						flexGrow: 1,
						display: "flex",
						alignItems: "center",
						gap: 2,
						ml: { lg: 0, xs: 1 },
					}}
				>
					<Typography
						variant="h3"
						component="div"
						sx={{
							display: { xs: "none", sm: "block" },
							fontWeight: 600,
							color: "text.primary",
						}}
					>
						Police Stop & Search Dashboard
					</Typography>
				</Box>
			</ToolbarStyled>
		</AppBarStyled>
	);
}

// Main Header component with Suspense wrapper
const Header = ({ toggleMobileSidebar }: ItemType) => {
	return (
		<Suspense
			fallback={
				<HeaderFallback toggleMobileSidebar={toggleMobileSidebar} />
			}
		>
			<HeaderContent toggleMobileSidebar={toggleMobileSidebar} />
		</Suspense>
	);
};

Header.propTypes = {
	sx: PropTypes.object,
};

export default Header;
