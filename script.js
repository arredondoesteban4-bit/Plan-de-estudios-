let materiasAprobadas = JSON.parse(localStorage.getItem("aprobadas")) || [];

fetch("materias.json")
  .then(res => res.json())
  .then(materias => {
    const tramo1 = document.getElementById("tramo1");
    const tramo2 = document.getElementById("tramo2");
    const profesional = document.getElementById("profesional");

    function actualizarVista() {
      tramo1.innerHTML = "";
      tramo2.innerHTML = "";
      profesional.innerHTML = "";

      let aprob = 0, sumaNotas = 0;

      materias.forEach(materia => {
        const div = document.createElement("div");
        div.className = "materia";

        const cumplidas = materia.requisitos.every(r => materiasAprobadas.includes(r));
        const aprobada = materiasAprobadas.includes(materia.codigo);
        const nota = localStorage.getItem(`nota-${materia.codigo}`) || "";

        // Estado visual
        if (aprobada) div.classList.add("aprobada");
        else if (cumplidas) div.classList.add("habilitada");
        else div.classList.add("bloqueada");

        div.innerHTML = `
          <div class="fila-superior">
            <div class="celda nota">${nota ? nota : "-"}</div>
            <div class="celda codigo">${materia.codigo}</div>
            <div class="celda carga">${materia.carga_horaria}</div>
          </div>
          <div class="nombre-materia">${materia.nombre}</div>
        `;

        if (cumplidas || aprobada) {
          div.addEventListener("click", () => {
            if (!aprobada) {
              const n = prompt(`Nota final ${materia.nombre} (4-10):`);
              if (n >= 4 && n <= 10) {
                materiasAprobadas.push(materia.codigo);
                localStorage.setItem(`nota-${materia.codigo}`, n);
                localStorage.setItem("aprobadas", JSON.stringify(materiasAprobadas));
              }
            } else if (confirm("Deseás desmarcarla?")) {
              materiasAprobadas = materiasAprobadas.filter(c => c !== materia.codigo);
              localStorage.removeItem(`nota-${materia.codigo}`);
              localStorage.setItem("aprobadas", JSON.stringify(materiasAprobadas));
            }
            actualizarVista();
          });
        }

        if (materia.tramo === "Primer tramo") tramo1.appendChild(div);
        else if (materia.tramo === "Segundo tramo") tramo2.appendChild(div);
        else profesional.appendChild(div);

        if (aprobada && nota) {
          aprob++;
          sumaNotas += parseFloat(nota);
        }
      });

      const total = materias.length;
      const pct = ((aprob / total) * 100).toFixed(1);
      const prom = aprob ? (sumaNotas / aprob).toFixed(2) : "0.00";

      document.getElementById("stats-text").innerText = `${aprob} de ${total} materias aprobadas`;
      document.getElementById("promedio-text").innerText = `Promedio: ${prom}`;
      document.getElementById("barra-progreso").style.width = `${pct}%`;
    }

    actualizarVista();
  })
  .catch(e => console.error("Error carga materias:", e));

function exportarPDF() {
  window.print();
}
