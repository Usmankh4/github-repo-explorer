import getApiBaseUrl from "../../lib/apiBaseUrl"
export type RegistrationRequest = {
    username: string
    password: string
}

export type SuccessfulRegistrationResponse = {
    id: number
    username: string
}

export type ApiError = {
    message: string
}

export type LoginRequest = {
    username: string
    password: string
}
export type SuccessfulLoginResponse = { // backend sends back these three values once
    id: number
    username: string
    token: string
}
function isSuccessfulLoginResponse(data: unknown): data is SuccessfulLoginResponse{
    return (
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data) &&
        "id" in data &&
        typeof (data as { id: unknown }).id === "number" &&
        "username" in data &&
        typeof (data as { username: unknown }).username === "string" && "token" in data && typeof(data as {token: unknown}).token === "string"
      );
    }

function isApiError(data: unknown): data is ApiError{
    return ( typeof data === "object" && !Array.isArray(data) && data !== null && "message" in data && typeof(data as {message: unknown}).message === "string")
}

function isSuccessfulRegistrationResponse(data: unknown): data is SuccessfulRegistrationResponse {
    return (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data) &&
      "id" in data &&
      typeof (data as { id: unknown }).id === "number" &&
      "username" in data &&
      typeof (data as { username: unknown }).username === "string"
    );
  }



export async function loginUser(login: LoginRequest): Promise<SuccessfulLoginResponse>{
    const response = await fetch(`${getApiBaseUrl()}/auth/login`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(login)

    });
    const data: unknown = await response.json();
    if(!response.ok){
        if(isApiError(data)){
            throw new Error(data.message)
        }else{
            throw new Error(`${response.status}`)
        }
    }
    if(!isSuccessfulLoginResponse(data)){
        throw new Error("Unexpected response shape from endpoint")
    }
    return data;
}

export async function registerUser(registration: RegistrationRequest): Promise<SuccessfulRegistrationResponse>{
    const response = await fetch(`${getApiBaseUrl()}/auth/register`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registration)
    });
    const data: unknown = await response.json();
    if(!response.ok){
        if(isApiError(data)){
            throw new Error(data.message)
        }else{
            throw new Error(`${response.status}`)
        }
    }

    if(!isSuccessfulRegistrationResponse(data)){
        throw new Error("Unexpected response shape from endpoint")
    }
    return data;

}

