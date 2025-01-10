import SparklesIcon from "./SparklesIcon";
import Image from 'next/image';

import rohit1 from "../Images/rohit-1.png"
import rohit2 from "../Images/rohit-2.png"

export default function DemoSection() {
     return (
          <section className="flex justify-between mt-12 items-center">
               <div className="bg-gray-800/50 w-[250px] h-[300px] rounded-xl">
                    <Image src={rohit1} alt="Description of your image" className="rounded-xl" />
               </div>
               <SparklesIcon />
               <div className="bg-gray-800/50 w-[250px] h-[300px] rounded-xl">
                    <Image src={rohit2} alt="Description of your image" className="rounded-xl" />
               </div>
          </section>
     )
}