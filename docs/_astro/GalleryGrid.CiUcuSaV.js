import{j as e}from"./jsx-runtime.D_zvdyIk.js";import"./index.-iFofLld.js";function s({children:i,photos:l}){const d=l.length%2!==0?l.slice(0,l.length-1):l;return e.jsxs("div",{style:{width:"100%"},children:[e.jsx("div",{className:"gallery-desktop",children:i}),e.jsx("div",{className:"gallery-mobile",style:{padding:"0 20px",boxSizing:"border-box",width:"100%"},children:e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"8px"},children:d.map((t,a)=>e.jsx("div",{style:{aspectRatio:"1 / 1",backgroundColor:"#F6F4F1",borderRadius:"2px",overflow:"hidden"},children:e.jsx("img",{src:t,alt:"Completed Remodel Project",style:{width:"100%",height:"100%",objectFit:"cover",display:"block"},loading:"lazy",decoding:"async"})},a))})}),e.jsx("style",{children:`
        @media (min-width: 1201px) {
          .gallery-desktop { display: block !important; }
          .gallery-mobile { display: none !important; }
        }
        @media (max-width: 1200px) {
          .gallery-desktop { display: none !important; }
          .gallery-mobile { display: block !important; }
        }
      `})]})}export{s as default};
