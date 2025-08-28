import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLoggedInUser,
  updateUser,
  type AuthResponse,
} from "../../reducers/auth/authReducer";
import { toast } from "sonner";
import backendApi from "../../api/backendApi";

const UserProfile = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [edit, setEdit] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loggedInUser?.name) {
      setName(loggedInUser.name);
    }
    if (loggedInUser?.email) {
      setEmail(loggedInUser.email);
    }
  }, [loggedInUser]);

  const handleEditClick = () => {
    setEdit((prev) => !prev);
  };

  const token = localStorage.getItem("token");

  const handleSaveClick = async () => {
    try {
      const { data } = await backendApi.post<AuthResponse>(
        "/api/v1/user/update",
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(updateUser({ email, name }));
        setEdit(false)
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  return (
    <div className="flex w-full pr-2 h-screen">
      <SideBar />
      <main className="flex-1 ml-4 lg:ml-[17rem] pr-2 z-10">
        <section className="p-6 bg-white shadow-lg rounded-lg w-full border border-gray-200 mt-7">
          <h1 className="text-center font-semibold text-xl text-gray-700 mb-6">
            Personal Details
          </h1>

          <div className="container flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="name" className="font-medium text-gray-600 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your name"
                value={name}
                disabled={!edit}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-colors ${
                  edit
                    ? "border-blue-500 bg-white"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                disabled={!edit}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-colors ${
                  edit
                    ? "border-blue-500 bg-white"
                    : "border-gray-300 bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => (edit ? handleSaveClick() : handleEditClick())}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors font-medium cursor-pointer"
              >
                {edit ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserProfile;
