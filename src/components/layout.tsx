import { PropsWithChildren } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';



// export const PageLayout = (props: PropsWithChildren) => {
//     return (
//       <main className="flex h-screen justify-center">
//         <div className="flex w-full">
//           {/* Sidebar */}
//           <div className="w-1/4 justify-left">
//             {/* Add your sidebar content here */}
//             <p style={{ fontSize: '40px', textAlign: 'right', margin: '15px' }}><FontAwesomeIcon icon={faTwitter} style={{color: "#3c9ae2",}} /></p>
//           </div>
  
//           {/* Main Content */}
//           <div className="w-full border-x md:max-w-2xl overflow-y-scroll">
//             {props.children}
//           </div>
//         </div>
//       </main>
//     );
//   };


  export const Sidebar: React.FC = () => (
    <div className="w-1/4 justify-left">
      {/* Add your sidebar content here */}
      <p style={{ fontSize: '40px', textAlign: 'right', margin: '15px' }}>
        <FontAwesomeIcon icon={faTwitter} style={{ color: "#3c9ae2" }} />
      </p>
    </div>
  );


  export const PageLayout = (props: PropsWithChildren) => {
    return (
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          {props.children}
        </div>
      </main>
    );
  };
  
  