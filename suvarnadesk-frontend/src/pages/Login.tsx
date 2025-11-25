// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   MdLockOutline,
//   MdPerson,
//   MdVisibility,
//   MdVisibilityOff,
// } from "react-icons/md";
// import { motion } from "framer-motion";
// import { useAuth } from "../contexts/AuthContext";
// import LoadingSpinner from "../components/LoadingSpinner";

// const Login: React.FC = () => {
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       await login(email, password);
//       navigate("/");
//     } catch (error) {
//       // Error handled in auth context
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900">
//       {/* Background illustration (optional) */}
//       <motion.div
//         initial={{ scale: 1.2, opacity: 0.2 }}
//         animate={{ scale: 1, opacity: 0.4 }}
//         transition={{ duration: 1 }}
//         className="absolute inset-0 z-0 pointer-events-none"
//         style={{
//           background:
//             "radial-gradient(circle at 60% 20%, rgba(255,255,255,0.12) 0, transparent 70%), radial-gradient(circle at 20% 80%, rgba(64,197,255,0.11) 0, transparent 60%)",
//         }}
//       />

//       {/* Centered Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 40, scale: 0.98 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="z-10 w-full max-w-lg mx-auto"
//       >
//         <form
//           className="p-8 space-y-8 border border-gray-200 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl"
//           onSubmit={handleLogin}
//         >
//           {/* Logo & Title */}
//           <div className="text-center">
//             <div className="flex justify-center mb-6">
//               <div className="p-4 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-600 drop-shadow-lg">
//                 <MdPerson className="text-4xl text-white" />
//               </div>
//             </div>
//             <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-blue-900">
//               SuvarnaDesk Admin
//             </h2>
//             <p className="text-gray-600">Sign in to your account</p>
//           </div>

//           {/* Inputs */}
//           <div className="space-y-6">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block mb-2 text-sm font-semibold text-blue-900"
//               >
//                 Email
//               </label>
//               <input
//                 id="email"
//                 className="w-full px-5 py-3 font-medium text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 type="email"
//                 required
//                 placeholder="Enter your admin email"
//                 disabled={isLoading}
//                 autoComplete="username"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block mb-2 text-sm font-semibold text-blue-900"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   className="w-full px-5 py-3 pr-12 font-medium text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   type={showPassword ? "text" : "password"}
//                   required
//                   placeholder="Enter your password"
//                   disabled={isLoading}
//                   autoComplete="current-password"
//                 />
//                 <button
//                   type="button"
//                   className="absolute text-gray-500 transition-colors transform -translate-y-1/2 right-4 top-1/2 hover:text-blue-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <MdVisibilityOff size={22} />
//                   ) : (
//                     <MdVisibility size={22} />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <motion.button
//             type="submit"
//             disabled={isLoading}
//             whileHover={{ scale: isLoading ? 1 : 1.04 }}
//             whileTap={{ scale: isLoading ? 1 : 0.96 }}
//             className="flex items-center justify-center w-full gap-2 py-3 mt-2 font-semibold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             <MdLockOutline className="text-xl" />
//             {isLoading ? "Signing In..." : "Sign In"}
//           </motion.button>

//           {/* Instructions / Warning */}
//           <div className="pt-2 pb-2 mt-4 text-sm text-center text-yellow-800 border-t border-yellow-200 rounded-b-xl bg-yellow-50/80">
//             <p className="font-semibold">Only authorized admins may sign in.</p>
//             <p>Please contact your administrator if you need access.</p>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();
  const { login } = useAuth();

  // Custom form validation
  const validate = () => {
    let valid = true;
    let errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Enter a valid email address";
      valid = false;
    }

    if (!password) {
      errs.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(errs);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col w-screen h-screen md:flex-row">
      {/* Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center px-10 py-10 md:w-1/2 bg-gradient-to-tr from-blue-700 via-purple-700 to-indigo-900 md:px-20"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="">
            <LoadingSpinner text="" />
          </div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white md:text-5xl drop-shadow-lg">
            SuvarnaDesk
          </h1>
          <div className="px-4 py-2 text-lg font-semibold shadow bg-blue-900/20 rounded-xl text-white/90">
            Admin Portal
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center md:w-1/2 bg-slate-50"
      >
        <form
          className="w-full max-w-md p-8 mx-auto space-y-8 bg-white border-t-8 border-blue-700 shadow-2xl rounded-3xl"
          onSubmit={handleLogin}
          noValidate
        >
          <div className="text-center mb-7">
            <h3 className="mb-1 text-2xl font-bold tracking-tight text-blue-900">
              Admin Login
            </h3>
            <p className="text-gray-500">Sign in to continue.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-semibold text-blue-900"
              >
                Email
              </label>
              <input
                id="email"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50 font-medium ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Your admin email"
                disabled={isLoading}
                autoComplete="username"
              />
              {errors.email && (
                <div className="mt-1 text-xs text-red-700">{errors.email}</div>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-blue-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50 font-medium ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={22} />
                  ) : (
                    <MdVisibility size={22} />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1 text-xs text-red-700">
                  {errors.password}
                </div>
              )}
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-semibold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <MdLockOutline className="text-xl" />
            {isLoading ? "Signing In..." : "Sign In"}
          </motion.button>

          <div className="pt-2 pb-2 mt-4 text-sm text-center text-yellow-800 border-t border-yellow-200 rounded-b-xl bg-yellow-50/80">
            <p className="font-semibold">Only authorized admins may sign in.</p>
            <p>Please contact your administrator if you need access.</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
