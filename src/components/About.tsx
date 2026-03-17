import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Photo */}
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/team.jpg"
              alt="The team behind Lawn & Order"
              width={1000}
              height={1200}
              className="w-full h-auto"
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
              Howdy! We&apos;re two local high school students who started this
              lawn care business to earn money and learn what it takes to run a
              successful operation. As Christians, we approach our work with
              honesty, reliability, and genuine respect for the people we serve.
              What started as a simple idea has grown into something we&apos;re
              proud of &mdash; a chance to build real-world skills, develop a
              strong work ethic, and serve our community by keeping local lawns
              looking their best.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              <strong className="text-forest">Jack:</strong> I&apos;m
              homeschooled and passionate about giving back. I enjoy mowing for
              veterans, volunteering at church events, and being a positive
              presence in my community. This business is teaching me skills
              I&apos;ll carry for life &mdash; scheduling, accountability,
              initiative, and responsibility.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              <strong className="text-forest">Everett:</strong> I attend Lindale
              High School and see this business as a chance to learn what it
              really takes to run something from the ground up. I want to use my
              time wisely before college and prove to my family, my community,
              and God that I&apos;m someone who shows up, works hard, and takes
              initiative.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              We&apos;re grateful for every yard we get to care for. Thanks for
              supporting young, local entrepreneurs!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
