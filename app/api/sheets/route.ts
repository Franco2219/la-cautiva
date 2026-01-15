// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sheet = searchParams.get('sheet');
  const range = searchParams.get('range');

  if (!id || !sheet) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
  if (range) url += `&range=${range}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store', // Para que siempre traiga datos frescos
    });
    const data = await response.text();
    return new NextResponse(data, {
      headers: { 'Content-Type': 'text/csv' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al conectar con Google' }, { status: 500 });
  }
}
