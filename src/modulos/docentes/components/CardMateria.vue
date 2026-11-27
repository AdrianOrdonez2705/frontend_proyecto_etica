<template>
  <div class="card-container">
    <div class="header">
      <h2 class="title">{{ curso.nombre }}</h2>
      <p class="codigo">ID: {{ curso.id_materia }}</p>
    </div>

    <div class="content">
      <div class="info-grid">
        <div class="box">
          <p>Cupo</p>
          <div class="pill">{{ curso.cupo }}</div>
        </div>
        <div class="box">
          <p>Inscritos</p>
          <div class="pill">{{ curso.inscritos }}</div>
        </div>
      </div>

      <div class="schedule-section">
        <div class="pill dia">{{ curso.dia }}</div>
        <div class="horarios">
          <span class="pill small">{{ curso.hora_inicio }}</span>
          <span class="pill small">{{ curso.hora_fin }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="btn" @click="$emit('view')">Ver más</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  curso: { type: Object, required: true },
});
defineEmits(["view"]);
</script>

<style scoped>
.card-container {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition), box-shadow var(--transition),
    border-color var(--transition);
}

.card-container:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.title {
  margin: 0;
  font-size: var(--text-h3);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}

.codigo {
  margin: var(--space-1) 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.docente {
  margin: var(--space-1) 0 var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.box {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.box p {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.box .pill {
  padding: 0;
  background: transparent;
  border: none;
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text);
  text-align: left;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px var(--space-3);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.schedule-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.pill.dia {
  background: var(--color-primary-soft);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  font-weight: 600;
}

.horarios {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
}

.small {
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

.footer {
  margin-top: auto;
  display: flex;
}

.btn {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), border-color var(--transition),
    color var(--transition);
}

.btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

@media (max-width: 480px) {
  .card-container {
    padding: var(--space-4);
  }
}
</style>
