// src/app//[force]/page.tsx
import PageContainer from "@/app/components/PageContainer";
import DashboardClient from "./DashboardClient";

interface PageProps {
	params: Promise<{
		force: string;
	}>;
	searchParams: Promise<{
		date?: string;
	}>;
}

// Remove "use client" - this should be a Server Component
export default async function DynamicDashboardPage({
	params,
	searchParams,
}: PageProps) {
	// Await the params and searchParams in the server component
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<PageContainer title="Dashboard" description="this is Dashboard">
			<DashboardClient
				initialParams={{
					params: resolvedParams,
					searchParams: resolvedSearchParams,
				}}
			/>
		</PageContainer>
	);
}
