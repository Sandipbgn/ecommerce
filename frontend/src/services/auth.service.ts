type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

type AuthResponse = {
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    token: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030/api";

export const authService = {
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
