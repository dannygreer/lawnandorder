import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Photo */}
          <div className="relative h-[500px] overflow-hidden rounded-2xl sm:h-[600px]">
            <Image
              src="/images/team.jpg"
              alt="The team behind Lindale Lawn Co."
              fill
              className="object-cover"
            />
          </div>

          {/* Right — Info */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-green-brand">
              About Us
            </span>
            <h2 className="mt-3 text-4xl font-bold text-forest sm:text-5xl">
              Meet the Crew
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
