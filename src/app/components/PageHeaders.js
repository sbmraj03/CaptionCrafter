export default function PageHeaders(
     {
          h1Text = 'Hello',
          h2Text = 'Subheader'
     }) {
     return (
          <section className="text-center mt-8 mb-8">
               <h1 className="text-2xl" style={{ textShadow: '1px 3px 0 rgba(0,0,0,.1' }}>
                    {h1Text}
               </h1>
               <h2 className="text-white/75">
                    {h2Text}               
               </h2>
          </section>
     )
}
