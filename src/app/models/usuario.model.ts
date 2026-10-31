export interface UsuarioRegistroRequest {
  correoElectronico: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  nombreRol: 'ESTUDIANTE' | 'ARRENDADOR';
  nombreUniversidad?: string;
  presupuestoMaximo?: number;
  cuentaBancaria?: string;
}

export interface UsuarioRegistroResponse {
  idUsuario: number;
  correoElectronico: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idRol: number;
  nombreRol: string;
  idPerfilEstudiante?: number;
  idPerfilArrendador?: number;
  nombreUniversidad?: string;
  presupuestoMaximo?: number;
  cuentaBancaria?: string;
}
