// src/app/layout.tsx
"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { PoliceForceProvider } from "@/app/contexts/PoliceForceContext";

import "./global.css";

const MainWrapper = styled("div")(() => ({
	display: "flex",
	minHeight: "100vh",
	width: "100%",
}));

const PageWrapper = styled("div")(() => ({
	display: "flex",
	flexGrow: 1,
	paddingBottom: "60px",
	flexDirection: "column",
	zIndex: 1,
	backgroundColor: "transparent",
}));

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	const [isSidebarOpen, setSidebarOpen] = useState(true);
	const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	return (
		<html lang="en">
			<body>
				<ThemeProvider theme={baselightTheme}>
					<CssBaseline />
					<PoliceForceProvider>
						<MainWrapper className="mainwrapper">
							<Sidebar
								isSidebarOpen={isSidebarOpen}
								isMobileSidebarOpen={isMobileSidebarOpen}
								onSidebarClose={() => setMobileSidebarOpen(false)}
							/>
							<PageWrapper className="page-wrapper">
								<Header toggleMobileSidebar={() => setMobileSidebarOpen(true)}/>
								<Container
									sx={{
										paddingTop: "20px",
										maxWidth: "1200px",
									}}
								>
									<Box sx={{ minHeight: "calc(100vh - 170px)" }}>
										{children}
									</Box>
								</Container>
							</PageWrapper>
						</MainWrapper>
					</PoliceForceProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
