
import { useEffect, useState, useRef } from "react";
import SparklesIcon from "./SparklesIcon";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { transcriptionItemsToSrt } from "../libs/awsTranscriptionHelpers";

import roboto from './../fonts/Roboto-Regular.ttf'
import robotoBold from './../fonts/Roboto-Bold.ttf'

export default function ResultVideo({ filename, transcriptionItems }) {
     const videoUrl = "https://dkvg77-caption-crafter.s3.amazonaws.com/" + filename;
     const [loaded, setLoaded] = useState(false);
     const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
     const [outlineColor, setOutlineColor] = useState('#FFFFFF');
     const [compressVideo, setCompressVideo] = useState(false);
     const [compressionAmount, setCompressionAmount] = useState(50);

     const [progress, setProgress] = useState(1);
     const ffmpegRef = useRef(new FFmpeg());
     const videoRef = useRef(null);

     useEffect(() => {
          videoRef.current.src = videoUrl;
          load();
     }, []);

     const load = async () => {
          const ffmpeg = ffmpegRef.current;
          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
          await ffmpeg.load({
               coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
               wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          });
          await ffmpeg.writeFile('/tmp/roboto.ttf', await fetchFile(roboto));
          await ffmpeg.writeFile('/tmp/roboto-bold.ttf', await fetchFile(robotoBold));
          setLoaded(true);
     }

     function toFFmpegColor(rgb) {
          const bgr = rgb.slice(5, 7) + rgb.slice(3, 5) + rgb.slice(1, 3);
          return '&H' + bgr + '&';
     }

     const transcode = async () => {
          const ffmpeg = ffmpegRef.current;
          const srt = transcriptionItemsToSrt(transcriptionItems);
          await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
          await ffmpeg.writeFile('subs.srt', srt);
          videoRef.current.src = videoUrl;
          await new Promise((resolve, reject) => {
               videoRef.current.onloadedmetadata = resolve;
          });
          const duration = videoRef.current.duration;
          ffmpeg.on('log', ({ message }) => {
               console.log(message)
               const regexResult = /time=([0-9:.]+)/.exec(message);
               if (regexResult && regexResult?.[1]) {
                    const howMuchIsDone = regexResult?.[1];
                    const [hours, minutes, seconds] = howMuchIsDone.split(':');
                    const doneTotalSeconds = hours * 3600 + minutes * 60 + seconds;
                    const videoProgress = doneTotalSeconds / duration;
                    setProgress(videoProgress);
               }
          });

          const ffmpegCommand = [
               '-i', filename,
               // '-preset', 'ultrafast',
               '-vf', `subtitles=subs.srt:fontsdir=/tmp:force_style='Fontname=Roboto Bold,FontSize=30,MarginV=70,PrimaryColour=${toFFmpegColor(primaryColor)},OutlineColour=${toFFmpegColor(outlineColor)}'`
          ];

          const crfValue = (compressionAmount / 2);
          if (compressVideo) {
               ffmpegCommand.push('-crf', crfValue.toString());
           }
       
          ffmpegCommand.push('output.mp4');
          console.log(ffmpegCommand);

          await ffmpeg.exec(ffmpegCommand);

          const data = await ffmpeg.readFile('output.mp4');
          videoRef.current.src =
               URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
          setProgress(1);
     }

     return (
          <>
               <div className="flex flex-col items-center">

                    <div className="text-xl font-semibold mb-4">
                         Do some customizations
                    </div>
                    <div className="flex items-center mb-4">
                         <span className="mr-2">Compress Video:</span>
                         <input
                              type="checkbox"
                              checked={compressVideo}
                              onChange={ev => setCompressVideo(ev.target.checked)}
                         />
                    </div>
                    {compressVideo && (
                         <div className="flex items-center mb-4">
                              <span className="mr-2">Amount:</span>
                              <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={compressionAmount}
                                   onChange={ev => setCompressionAmount(ev.target.value)}
                                   className="w-36"
                              />
                              <span className="ml-2">{compressionAmount}%</span>
                         </div>
                    )}
                    <div className="flex items-center mb-4">
                         <div className="flex items-center mr-4">
                              <span className="mr-2">Primary:</span>
                              <input
                                   type="color"
                                   value={primaryColor}
                                   onChange={ev => setPrimaryColor(ev.target.value)}
                                   className="border rounded"
                              />
                         </div>
                         <div className="flex items-center">
                              <span className="mr-2">Outline:</span>
                              <input
                                   type="color"
                                   value={outlineColor}
                                   onChange={ev => setOutlineColor(ev.target.value)}
                                   className="border rounded"
                              />
                         </div>
                    </div>
                    <div className="mb-4 ">
                         <button
                              onClick={transcode}
                              className="bg-green-600 py-2 px-6 rounded-full inline-flex gap-2 border-2 border-purple-700/50 cursor-pointer">
                              <SparklesIcon />
                              <span>Apply captions</span>
                         </button>
                    </div>
               </div>
               <div className="rounded-xl overflow-hidden relative">
                    {progress && progress < 1 && (
                         <div className="absolute inset-0 bg-black/80 flex items-center">
                              <div className="w-full text-center">
                                   <div className="bg-bgg1/50 mx-8 rounded-lg overflow-hidden relative">
                                        <div className="bg-bgg1 h-8"
                                             style={{ width: progress * 100 + '%' }}>
                                             <h3 className="text-white text-xl absolute inset-0 py-1">
                                                  {parseInt(progress * 100)}%
                                             </h3>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}
                    <video
                         data-video={0}
                         ref={videoRef}
                         controls>
                    </video>
               </div>
          </>
     );
}