import axios from "../config/axios";

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios.post("/auth/register", {
      username: name,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Check for existing user error
    if (error?.response?.status === 400 && 
        error?.response?.data?.message?.includes("User already exists")) {
      console.log("User already exists error detected");
      throw new Error("User already exists");
    }
    
    // Handle other error messages
    if (error?.response?.data) {
      const errorMessage = error?.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
    }
    throw new Error("An unexpected error occurred during registration");
  }
};

export const loginUser = async (
  email: string,
  password: string,
  role: string = "user"
): Promise<any> => {
  try {
    const response = await axios.post("/auth/login", { email, password, role });
    // Return both user and token
    return {
      ...response.data.user,
      token: response.data.token
    };
  } catch (error: any) {
    // Handle specific error messages including email verification errors
    if (error?.response?.data) {
      // Check if this is a verification error
      if (error.response.data.needsVerification) {
        const verificationError = new Error(error.response.data.message || "Email verification required");
        // Add a custom property to indicate verification is needed
        (verificationError as any).needsVerification = true;
        throw verificationError;
      }
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
};

export const googleAuthLogin = async (
  userData: { email: string; name: string; photoURL?: string; uid: string }
): Promise<any> => {
  try {
    // Send refresh option to indicate if profile should be refreshed with latest Google data
    const response = await axios.post("/auth/google-auth", {
      ...userData,
      syncProfile: true // Always sync profile data on login
    });
    return response.data;
  } catch (error: any) {
    console.error("Google auth error:", error);
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Google authentication failed");
    }
    throw new Error("An unexpected error occurred during Google authentication");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post("/auth/logout");
  } catch (error: any) {
    console.error("Logout error:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Logout failed");
    }
    throw new Error("An unexpected error occurred during logout");
  }
};


export const verifyAuth = async ():Promise<any> =>{
  try{
    const response = await axios.get("/auth/verify");
    return response.data;
  }catch(error:any){
    console.error("Verification error:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Verification failed");
    }
    throw new Error("An unexpected error occurred during verification");
  }
}
