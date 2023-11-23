import Link from "next/link";
import Image from "next/image";

import Button from "@/components/Button";

import HeroImage from "@/assets/HeroImage.png";
import Step1 from "@/assets/step1.png";
import Step2 from "@/assets/step2.png";
import Step3 from "@/assets/step3.png";
import Step4 from "@/assets/step4.png";

export default function Home() {
  const steps = [
    {
      title: "1) Join",
      description:
        "Join or create a room with friends, colleagues, or other enthusiasts.",
      image: Step1,
    },
    {
      title: "2) Pomodoro",
      description:
        "Choose your time settings and focus on work, reading, or studying for the session.",
      image: Step2,
    },
    {
      title: "3) Draw",
      description:
        "After you complete a pomodoro session, draw pixels on the collaborative canvas.",
      image: Step3,
    },
    {
      title: "4) Chat",
      description:
        "Enjoy your breaks while chatting with everyone in the room.",
      image: Step4,
    },
  ];
  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row text-center items-center pb-8 md:pb-32">
        <div className="w-full my-8 md:w-2/3">
          <h1 className="text-4xl md:text-8xl font-bold mb-4">Cowork & Draw</h1>
          <p className="text-lg md:text-xl mb-8">
            Collaborative pomodoro app to complete pomodoro sessions together,
            <br />
            create pixel art together, and chat during breaks.
          </p>
          <div className="flex w-full gap-8 justify-center">
            <Link href="/rooms">
              <Button>Rooms -&gt;</Button>
            </Link>
            <Link href="/create">
              <Button>Create a room -&gt;</Button>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/3 mb-4 md:mb-0 border-4 border-black rotate-2 hover:-rotate-2 transition-all">
          <Image src={HeroImage} alt={"Hero Image"} width={700} height={700} />
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-16 text-center">
            How does it work?
          </h2>
          <div className="space-y-4 md:space-y-28">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center mb-6"
              >
                <div className="w-full mb-2 p-0 md:pr-4 md:w-1/2">
                  <h3 className="text-xl md:text-5xl font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg">{step.description}</p>
                </div>
                <div className="w-full md:w-1/2 mb-4 md:mb-0 border-4 border-black rotate-1 hover:-rotate-1 transition-all">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={500}
                    height={500}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
