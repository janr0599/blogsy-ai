export default function Footer() {
    return (
        <footer className="h-20 py-24 px-12 z-20 relative overflow-hidden bg-gray-200/20">
            <div className="max-w-6xl flex items-center justify-center mx-auto">
                <p>All rights Reserved. {new Date().getFullYear()}</p>
            </div>
        </footer>
    );
}
