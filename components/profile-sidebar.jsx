import Image from "next/image";

export default function ProfileSidebar() {
	return (
		<>
			<aside className="w-full lg:w-64 space-y-4">
				<div className="bg-white border border-border rounded">
					<div className="p-3">
						<div className="flex flex-row lg:flex-col lg:items-start items-center gap-3">
							<Image
								src={`https://github.com/shadcn.png`}
								width={100}
								height={100}
								alt="Profile picture"
							/>
							<div className="flex-1 lg:flex-auto lg:w-full">
								<h2 className="text-base lg:text-lg font-bold text-primary mb-2">
									Carl Sanguyo
								</h2>
								<span className="mb-2 font-semibold">Wall</span>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-white border border-border rounded">
					<div className="bg-accent text-white p-2 text-sm font-bold rounded-t">
						Information
					</div>
					<div className="p-3 space-y-3 text-sm">
						<div>
							<div className="font-semibold text-foreground/80 mb-1">Networks</div>
							<div className="text-primary">CLSU Alumni 2025</div>
						</div>
						<div>
							<div className="font-semibold text-foreground/80 mb-1">
								Current City
							</div>
							<div>Cabanatuan City, Nueva Ecija, Philippines</div>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
