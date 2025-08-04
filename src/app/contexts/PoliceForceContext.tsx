// src/app/contexts/PoliceForceContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PoliceForce {
	id: string;
	name: string;
}

interface PoliceForceContextType {
	forces: PoliceForce[];
	isLoadingForces: boolean;
	selectedForce: string;
	selectedMonth: string;
	setSelectedForce: (force: string) => void;
	setSelectedMonth: (month: string) => void;
	getCurrentForceName: () => string;
	getFormattedMonth: () => string;
}

const PoliceForceContext = createContext<PoliceForceContextType | undefined>(undefined);

interface PoliceForceProviderProps {
	children: ReactNode;
}

export function PoliceForceProvider({ children }: PoliceForceProviderProps) {
	const [forces, setForces] = useState<PoliceForce[]>([]);
	const [isLoadingForces, setIsLoadingForces] = useState(true);
	const [selectedForce, setSelectedForce] = useState("metropolitan");
	const [selectedMonth, setSelectedMonth] = useState("");

	// Fetch police forces once when provider mounts
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

	const getCurrentForceName = () => {
		const force = forces.find((f) => f.id === selectedForce);
		return force ? force.name : selectedForce;
	};

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

	const value: PoliceForceContextType = {
		forces,
		isLoadingForces,
		selectedForce,
		selectedMonth,
		setSelectedForce,
		setSelectedMonth,
		getCurrentForceName,
		getFormattedMonth,
	};

	return (
		<PoliceForceContext.Provider value={value}>
			{children}
		</PoliceForceContext.Provider>
	);
}

export function usePoliceForce() {
	const context = useContext(PoliceForceContext);
	if (context === undefined) {
		throw new Error('usePoliceForce must be used within a PoliceForceProvider');
	}
	return context;
}
