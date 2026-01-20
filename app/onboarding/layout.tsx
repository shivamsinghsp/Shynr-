// Onboarding pages have no navbar/footer - minimal layout
export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
