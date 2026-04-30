type ApiResponse<T = any> = {
  data: T;
  status: number;
};

type ApiService = "main" | "opportunities";

const URLS = {
  main: process.env.REACT_APP_API_BASE_URL || "http://localhost:5104/api/",
  opportunities:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5104/api/",
};

const api = {
  getBaseUrl(service: ApiService = "main"): string {
    return URLS[service];
  },

  async createReceipt(data: {
    Id: number;
    UserCreated: number;
    DateCreated: string;
    UserUpdated: number;
    DateUpdated: string;
    LocationId: string;
    BomIds: string[];
    ReceivedFrom: string;
    CustomerName: string;
    SalesRepresentative: string;
    DocId: string;
    ReceiptDate: string;
    Comments: string;
  }) {
    return this.request("receipts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getIssues() {
    return this.request("Issues", {
      method: "GET",
    });
  },

  async getIssueById(id: number) {
    return this.request(`Issues/${id}`, {
      method: "GET",
    });
  },

  async updateReceipt(
    id: number,
    data: {
      Id: number;
      UserCreated: number;
      DateCreated: string;
      UserUpdated: number;
      DateUpdated: string;
      LocationId: string;
      BomIds: string[];
      ReceivedFrom: string;
      CustomerName: string;
      SalesRepresentative: string;
      DocId: string;
      ReceiptDate: string;
      Comments: string;
    }
  ) {
    return this.request(`receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // POST ItemAggregate (aggregated item payload)
  async postItemAggregate(
    body: import("../types/itemAggregate").ItemAggregate
  ) {
    return this.request("ItemAggregate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // PUT ItemAggregate (update existing item)
  async putItemAggregate(
    id: string | number,
    body: import("../types/itemAggregate").ItemAggregate
  ) {
    return this.request(`ItemAggregate/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  // POST multiple ItemMaster records in bulk
  async postItemMasterArray(
    items: import("../types/itemAggregate").ItemMasterArray
  ) {
    return this.request("ItemMaster/array", {
      method: "POST",
      body: JSON.stringify(items),
    });
  },
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    // Set up request headers with CORS and authentication
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // If body is FormData, let browser set Content-Type (including boundary)
    if ((options as any).body instanceof FormData) {
      delete (headers as any)["Content-Type"];
    }

    try {
      // Create the request URL
      const url = `${this.getBaseUrl(service)}${endpoint}`;

      // For OPTIONS requests, return success immediately
      if (options.method === "OPTIONS") {
        return {
          status: 200,
          data: null as any,
        };
      }

      // Make the actual request
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      }); // Handle 401 Unauthorized
      // Handle other error responses
      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.is404 = response.status === 404; // Add flag for 404 errors
        try {
          const errorData = await response.json();
          error.data = errorData;
        } catch (e) {
          error.data = null;
        }
        throw error;
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return { data, status: response.status };
      }

      return { data: null as T, status: response.status };
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // GET request
  get<T = any>(
    endpoint: string,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" }, service);
  },

  // GET BOM data by ID
  async getBOMById<T = any>(
    bomId: string,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      `bom/${bomId}`,
      { ...options, method: "GET" },
      service
    );
  },

  // GET product list for accessories with pagination and search
  async getProductAccessories<T = any>(
    params: { search?: string; limit?: number; page?: number },
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.page) queryParams.append("page", params.page.toString());

    const endpoint = `products/accessories?${queryParams.toString()}`;
    return this.request<T>(endpoint, { ...options, method: "GET" }, service);
  },

  // Get by ID
  getById<T = any>(
    resource: string,
    id: string | number,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      `${resource}/${id}`,
      { ...options, method: "GET" },
      service
    );
  },

  // POST request
  post<T = any>(
    endpoint: string,
    body: any,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    const isForm = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body: isForm ? body : JSON.stringify(body),
      },
      service
    );
  },

  // PUT request
  put<T = any>(
    endpoint: string,
    body: any,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    const isForm = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body: isForm ? body : JSON.stringify(body),
      },
      service
    );
  },

  // PATCH request
  patch<T = any>(
    endpoint: string,
    body: any,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    const isForm = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body: isForm ? body : JSON.stringify(body),
      },
      service
    );
  },

  // DELETE request
  delete<T = any>(
    endpoint: string,
    options: RequestInit = {},
    service: ApiService = "main"
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" }, service);
  },
};

export default api;
