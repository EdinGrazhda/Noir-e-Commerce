export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center">
                <img
                    src="/images/1-02.png"
                    alt="NOIR"
                    className="h-10 w-auto"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Noir Admin Panel
                </span>
            </div>
        </>
    );
}
