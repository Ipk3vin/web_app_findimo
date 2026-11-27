// Catálogo de universidades licenciadas de Lima y filiales en la ciudad.
// https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/
// https://www.gob.pe/14392
const universidades: readonly (readonly [nombre: string, sigla?: string, valor?: string])[] = [
  ['Pontificia Universidad Católica del Perú', 'PUCP'],
  ['Universidad Antonio Ruiz de Montoya', 'UARM'],
  ['Universidad Autónoma del Perú', 'UA'],
  ['Universidad Católica Sedes Sapientiae', 'UCSS'],
  ['Universidad César Vallejo', 'UCV'],
  ['Universidad Científica del Sur', 'UCSUR', 'UCSUR'],
  ['Universidad Continental'],
  ['Universidad de Ciencias y Artes de América Latina', 'UCAL'],
  ['Universidad de Ciencias y Humanidades', 'UCH'],
  ['Universidad de Ingeniería y Tecnología', 'UTEC'],
  ['Universidad de Lima', 'ULIMA'],
  ['Universidad de Piura', 'UDEP'],
  ['Universidad de San Martín de Porres', 'USMP'],
  ['Universidad del Pacífico', 'UP'],
  ['Universidad ESAN', 'ESAN'],
  ['Universidad Femenina del Sagrado Corazón', 'UNIFÉ'],
  ['Universidad Interamericana para el Desarrollo', 'UNID'],
  ['Universidad Jaime Bausate y Meza', 'UJBM'],
  ['Universidad Le Cordon Bleu', 'ULCB'],
  ['Universidad María Auxiliadora', 'UMA'],
  ['Universidad Marcelino Champagnat', 'UMCH'],
  ['Universidad Nacional Agraria La Molina', 'UNALM'],
  ['Universidad Nacional de Barranca', 'UNAB'],
  ['Universidad Nacional de Cañete', 'UNDC'],
  ['Universidad Nacional de Educación Enrique Guzmán y Valle', 'UNE'],
  ['Universidad Nacional de Ingeniería', 'UNI'],
  ['Universidad Nacional de Música', 'UNM'],
  ['Universidad Nacional Federico Villarreal', 'UNFV'],
  ['Universidad Nacional José Faustino Sánchez Carrión', 'UNJFSC'],
  ['Universidad Nacional Mayor de San Marcos', 'UNMSM'],
  ['Universidad Nacional Tecnológica de Lima Sur', 'UNTELS'],
  ['Universidad Peruana Cayetano Heredia', 'UPCH'],
  ['Universidad Peruana de Ciencias Aplicadas', 'UPC', 'UPC Chorrillos'],
  ['Universidad Peruana de las Américas', 'UPA'],
  ['Universidad Peruana Unión', 'UPeU'],
  ['Universidad Politécnica del Perú', 'UPP'],
  ['Universidad Privada del Norte', 'UPN'],
  ['Universidad Privada Norbert Wiener', 'UWIENER'],
  ['Universidad Privada San Juan Bautista', 'UPSJB'],
  ['Universidad Ricardo Palma', 'URP'],
  ['Universidad San Ignacio de Loyola', 'USIL'],
  ['Universidad Tecnológica del Perú', 'UTP']
];

export const UNIVERSIDADES_LIMA = universidades.map(([nombre, sigla, valor = nombre]) => ({
  nombre,
  sigla,
  valor
})).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function coincideUniversidad(valor: string, textos: string[], nombresCercanos: string[]): boolean {
  const universidad = UNIVERSIDADES_LIMA.find(opcion => opcion.valor === valor);
  if (!universidad) return false;

  const nombre = normalizar(universidad.nombre);
  const sigla = universidad.sigla ? normalizar(universidad.sigla) : '';
  const coincide = (texto: string, entorno: boolean) => {
    const limpio = normalizar(texto);
    return ` ${limpio} `.includes(` ${nombre} `)
      || !!sigla && (entorno || sigla.length >= 3) && ` ${limpio} `.includes(` ${sigla} `);
  };

  return nombresCercanos.some(texto => coincide(texto, true)) || textos.some(texto => coincide(texto, false));
}
