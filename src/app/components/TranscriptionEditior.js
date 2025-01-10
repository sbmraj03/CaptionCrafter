import TranscriptionItem from "./TranscriptionItem";

export default function TranscriptionEditor({
     awsTranscriptionItems,
     setAwsTranscriptionItems
}) {

     function updateTranscriptionItem(index, prop, ev) {
          const newAwsItems = [...awsTranscriptionItems];
          const newItem = {...newAwsItems[index]};
          newItem[prop] = ev.target.value;
          newAwsItems[index][prop] = ev.target.value;
          setAwsTranscriptionItems(newAwsItems);
     }

     return (


          <>
               <div className="grid grid-cols-3 sticky top-0 bg-violet-800/80 p-2 rounded-md">
                    <div>From</div>
                    <div>To</div>
                    <div>Content</div>
               </div>
               {
                    awsTranscriptionItems.length > 0 &&
                    (
                         <div>
                              {awsTranscriptionItems.map((item, key) => (
                                   <div key={key}>
                                        <TranscriptionItem
                                             handleStartTimeChange={ev =>
                                                  updateTranscriptionItem(key, 'start_time', ev)
                                             }
                                             handleEndTimeChange={ev =>
                                                  updateTranscriptionItem(key, 'end_time', ev)
                                             }
                                             handleContentChange={ev =>
                                                  updateTranscriptionItem(key, 'content', ev)
                                             }
                                             item={item} />

                                   </div>


                              ))}
                         </div>
                    )

               }
          </>
     )
}