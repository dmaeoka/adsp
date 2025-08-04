// Stats card component
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";

type trend = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export default function StatsCard({
	title,
	value,
	trend,
	trendValue,
}: {
	title: string;
	value: string;
	trend?: trend;
	trendValue?: string;
}) {
	return (
		<Card elevation={9} sx={{ height: '100%', flexGrow: 1 }}>
			<CardContent>
				<Typography component="h2" variant="subtitle2" gutterBottom>{title}</Typography>
				<Stack
					direction="column"
					sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
				>
					<Stack sx={{ justifyContent: 'space-between' }}>
						<Stack
							direction="row"
							sx={{ justifyContent: 'space-between', alignItems: 'center' }}
						>
							<Typography variant="h4" component="p">{value}</Typography>
							{ trend && trendValue && (
								<Chip size="small" color={trend} label={trendValue} />
							)}
						</Stack>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>Last 30 days</Typography>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
