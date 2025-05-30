// // components/ContactList.jsx
// import { useEffect, useState, useContext } from "react";
// import { db } from "../firebase";
// import { collection, onSnapshot } from "firebase/firestore";
// import { AuthContext } from "../Context/AuthContext";

// const ContactList = () => {
//   const [users, setUsers] = useState([]);
//   const { currentUser } = useContext(AuthContext);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
//       const allUsers = snapshot.docs
//         .map(doc => doc.data())
//         .filter(user => user.uid !== currentUser.uid); // skip self
//       setUsers(allUsers);
//     });

//     return () => unsub();
//   }, [currentUser.uid]);

//   return (
//     <div className="p-4 bg-white w-full max-w-sm h-screen overflow-y-auto border-r">
//       <h2 className="text-xl font-bold mb-4">Contacts</h2>
//       {users.map((user) => (
//         <div
//           key={user.uid}
//           className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
//         >
//           <img
//             src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
//             alt="avatar"
//             className="w-10 h-10 rounded-full"
//           />
//           <div>
//             <p className="font-medium">{user.displayName}</p>
//             <p className="text-sm text-gray-500">{user.email}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ContactList;
