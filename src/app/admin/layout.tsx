import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px',
                minHeight: '100vh',
                padding: '40px',
                maxWidth: '1600px',
                marginRight: 'auto'
            }}>
                {children}
            </main>
        </div>
    );
}
