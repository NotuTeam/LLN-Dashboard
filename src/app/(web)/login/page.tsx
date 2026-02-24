/** @format */
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useLogin } from "@/hooks/useAuth";

import { Form } from "antd";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import { User, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [formAction] = Form.useForm();

  const { mutate, isPending } = useLogin();

  const handleLogin = async () => {
    try {
      await formAction.validateFields();

      const payload = formAction.getFieldsValue();

      mutate(payload, {
        onSuccess() {
          Notification("success", "Login Success");
          router.push("/");
        },
        onError(error) {
          Notification("error", error.message || "Login Failed");
        },
      });
    } catch (error) {
      Notification("error", "Please fill in all required fields");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center min-w-full">
      <div
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dm1iagszk/image/upload/v1771821149/ruchindra-gunasekara-GK8x_XCcDZg-unsplash_gspk02.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
        }}
        className="w-1/2 h-[100dvh]"
      ></div>
      <div className="w-1/2 p-10 flex items-center justify-center flex-col">
        {/* Login Form */}
        <div className="p-8 w-[80%]">
          <Form
            form={formAction}
            onFinish={handleLogin}
            layout="vertical"
            className="space-y-6"
            requiredMark={false}
          >
            <div className="flex items-center justify-center mt-5 mb-10">
              <Image
                src="/logo-bgn.png"
                alt="logo-bgn"
                width={200}
                height={200}
              />
            </div>
            {/* <div className="flex items-center justify-center mt-5 mb-10">
              <span className="bg-primary-600 text-white p-5 text-2xl font-[600] rounded-3xl">
                LN
              </span>
            </div> */}
            <InputForm
              type="text"
              name="username"
              placeholder="Enter your username"
              label="Username"
              icon={<User className="w-5 h-5 text-gray-600" />}
              required
              className="mb-0"
            />

            <InputForm
              type="password"
              name="password"
              placeholder="Enter your password"
              label="Password"
              icon={<Lock className="w-5 h-5 text-gray-600" />}
              required
              className="mb-0"
            />

            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure dashboard access for authorized users only
          </p>
        </div>
      </div>
    </div>
  );
}
