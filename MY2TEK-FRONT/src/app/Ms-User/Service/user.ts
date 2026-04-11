import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class User {

  private apiUrl = 'http://localhost:8083/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    const payload = { ...userData, role: 'CLIENT' };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/reset-password`, payload);
}
loginWithGoogleBackend(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { token });
  }
  getToken(): string | null {
  return localStorage.getItem('auth_token');
}

getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token); 
      } catch (e) {
        console.error("Erreur de décodage token", e);
        return null;
      }
    }
    return null;
  }

logout() {
  localStorage.removeItem('auth_token');
}
updateUser(id: number, profileData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/update/${id}`, profileData);
}
getAllUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/all`);
}
deleteUser(id: number): Observable<string> {
  return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' });
}
}


