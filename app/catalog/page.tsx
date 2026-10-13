import Catalog from '@/components/catalog';
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        category?: string;
    }>;
}) { const params = await searchParams; return <Catalog key={params.category || 'all'} initialCategory={params.category || 'All services'}/>; }
