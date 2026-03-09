// Enhanced Physics Engine with Magnetic Forces and Collisions
class PhysicsEngine {
  constructor() {
    this.particles = [];
    this.gravity = 0.5;
    this.friction = 0.98;
    this.bounce = 0.7;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseRadius = 150;
    this.mouseForce = 0.8;
    this.isRunning = false;

    // New physics properties
    this.magneticForce = 0.3;
    this.collisionRadius = 8;
    this.maxParticles = 200;
    this.particleTypes = ["positive", "negative", "neutral"];

    // Force fields and vortices
    this.forceFields = [];
    this.vortices = [];
    this.weatherMode = "none"; // 'none', 'rain', 'snow'
    this.windForce = 0.1;
    this.windDirection = 0;

    // Orbital mechanics
    this.orbitalBodies = [];
    this.gravitationalConstant = 0.5;
  }

  addParticle(x, y, vx = 0, vy = 0, mass = 1, type = "floating") {
    if (this.particles.length >= this.maxParticles) return;

    const particleType =
      this.particleTypes[Math.floor(Math.random() * this.particleTypes.length)];
    const particle = {
      x,
      y,
      vx,
      vy,
      mass,
      type: particleType,
      size: Math.random() * 4 + 2,
      life: 1,
      decay: 0.99,
      color: this.getParticleColor(particleType),
      charge: this.getParticleCharge(particleType),
      id: Date.now() + Math.random(),
    };
    this.particles.push(particle);
  }

  // Add force field
  addForceField(x, y, radius, strength, type = "attract") {
    this.forceFields.push({
      x,
      y,
      radius,
      strength,
      type,
      life: 1,
      decay: 0.995,
    });
  }

  // Add vortex
  addVortex(x, y, radius, strength) {
    this.vortices.push({
      x,
      y,
      radius,
      strength,
      life: 1,
      decay: 0.998,
    });
  }

  // Add orbital body
  addOrbitalBody(x, y, mass, isCentral = false) {
    this.orbitalBodies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      mass,
      isCentral,
      radius: mass * 5,
      life: 1,
    });
  }

  // Set weather mode
  setWeatherMode(mode) {
    this.weatherMode = mode;
    if (mode === "rain") {
      this.gravity = 1.2;
      this.windForce = 0.05;
    } else if (mode === "snow") {
      this.gravity = 0.3;
      this.windForce = 0.08;
    } else {
      this.gravity = 0.5;
      this.windForce = 0.1;
    }
  }

  getParticleColor(type) {
    switch (type) {
      case "positive":
        return `hsl(${Math.random() * 30 + 0}, 80%, 60%)`; // Red/Orange
      case "negative":
        return `hsl(${Math.random() * 60 + 180}, 80%, 60%)`; // Blue/Cyan
      case "neutral":
        return `hsl(${Math.random() * 60 + 120}, 70%, 60%)`; // Green
      case "rain":
        return `hsl(210, 80%, 70%)`; // Blue
      case "snow":
        return `hsl(0, 0%, 95%)`; // White
      default:
        return `hsl(${Math.random() * 60 + 180}, 70%, 60%)`;
    }
  }

  getParticleCharge(type) {
    switch (type) {
      case "positive":
        return 1;
      case "negative":
        return -1;
      case "neutral":
        return 0;
      case "rain":
        return 0;
      case "snow":
        return 0;
      default:
        return 0;
    }
  }

  updateParticles() {
    // Update force fields and vortices
    this.updateForceFields();
    this.updateVortices();
    this.updateOrbitalBodies();

    // Generate weather particles
    this.generateWeatherParticles();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Apply gravity
      p.vy += this.gravity * p.mass;

      // Apply wind force
      p.vx += Math.cos(this.windDirection) * this.windForce;
      p.vy += Math.sin(this.windDirection) * this.windForce;

      // Apply mouse force field
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouseRadius && distance > 0) {
        const force =
          ((this.mouseRadius - distance) / this.mouseRadius) * this.mouseForce;
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }

      // Apply force fields
      this.applyForceFields(p);

      // Apply vortices
      this.applyVortices(p);

      // Apply orbital forces
      this.applyOrbitalForces(p);

      // Apply magnetic forces between particles
      this.applyMagneticForces(p, i);

      // Check for collisions
      this.checkCollisions(p, i);

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Apply friction
      p.vx *= this.friction;
      p.vy *= this.friction;

      // Bounce off walls with energy loss
      if (p.x < 0 || p.x > window.innerWidth) {
        p.vx *= -this.bounce;
        p.x = Math.max(0, Math.min(window.innerWidth, p.x));
        this.createCollisionEffect(p.x, p.y, "wall");
      }

      if (p.y > window.innerHeight) {
        p.vy *= -this.bounce;
        p.y = window.innerHeight;
        this.createCollisionEffect(p.x, p.y, "ground");
      }

      // Life decay
      p.life *= p.decay;

      // Remove dead particles
      if (p.life < 0.1) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateForceFields() {
    for (let i = this.forceFields.length - 1; i >= 0; i--) {
      const field = this.forceFields[i];
      field.life *= field.decay;

      if (field.life < 0.1) {
        this.forceFields.splice(i, 1);
      }
    }
  }

  updateVortices() {
    for (let i = this.vortices.length - 1; i >= 0; i--) {
      const vortex = this.vortices[i];
      vortex.life *= vortex.decay;

      if (vortex.life < 0.1) {
        this.vortices.splice(i, 1);
      }
    }
  }

  updateOrbitalBodies() {
    this.orbitalBodies.forEach((body) => {
      body.x += body.vx;
      body.y += body.vy;

      // Keep central body at mouse position
      if (body.isCentral) {
        body.x = this.mouseX;
        body.y = this.mouseY;
      }
    });
  }

  generateWeatherParticles() {
    if (this.weatherMode === "rain" && Math.random() < 0.3) {
      this.addParticle(
        Math.random() * window.innerWidth,
        -10,
        (Math.random() - 0.5) * 1,
        2 + Math.random() * 3,
        0.8,
        "rain"
      );
    } else if (this.weatherMode === "snow" && Math.random() < 0.2) {
      this.addParticle(
        Math.random() * window.innerWidth,
        -10,
        (Math.random() - 0.5) * 0.5,
        0.5 + Math.random() * 1,
        0.3,
        "snow"
      );
    }
  }

  applyForceFields(particle) {
    this.forceFields.forEach((field) => {
      const dx = field.x - particle.x;
      const dy = field.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < field.radius && distance > 0) {
        const force =
          ((field.radius - distance) / field.radius) *
          field.strength *
          field.life;

        if (field.type === "attract") {
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        } else if (field.type === "repel") {
          particle.vx -= (dx / distance) * force;
          particle.vy -= (dy / distance) * force;
        }
      }
    });
  }

  applyVortices(particle) {
    this.vortices.forEach((vortex) => {
      const dx = vortex.x - particle.x;
      const dy = vortex.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < vortex.radius && distance > 0) {
        const force =
          ((vortex.radius - distance) / vortex.radius) *
          vortex.strength *
          vortex.life;

        // Apply tangential force for vortex effect
        const tangentX = -dy / distance;
        const tangentY = dx / distance;

        particle.vx += tangentX * force;
        particle.vy += tangentY * force;
      }
    });
  }

  applyOrbitalForces(particle) {
    this.orbitalBodies.forEach((body) => {
      const dx = body.x - particle.x;
      const dy = body.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 200) {
        const force =
          (this.gravitationalConstant * body.mass) / (distance * distance);

        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }
    });
  }

  applyMagneticForces(particle, particleIndex) {
    for (let j = 0; j < this.particles.length; j++) {
      if (j === particleIndex) continue;

      const other = this.particles[j];
      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 100) {
        // Magnetic force based on charge
        const force =
          (this.magneticForce * particle.charge * other.charge) /
          (distance * distance);

        if (Math.abs(force) > 0.001) {
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }
      }
    }
  }

  checkCollisions(particle, particleIndex) {
    for (let j = particleIndex + 1; j < this.particles.length; j++) {
      const other = this.particles[j];
      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.collisionRadius) {
        // Elastic collision
        this.resolveCollision(particle, other);

        // Create collision effect
        this.createCollisionEffect(
          (particle.x + other.x) / 2,
          (particle.y + other.y) / 2,
          "particle"
        );

        // Chain reaction - create new particles
        if (Math.random() < 0.3) {
          this.createChainReaction(particle.x, particle.y);
        }
      }
    }
  }

  resolveCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = p2.vx - p1.vx;
    const dvy = p2.vy - p1.vy;

    // Relative velocity along normal
    const velAlongNormal = dvx * nx + dvy * ny;

    // Don't resolve if particles are moving apart
    if (velAlongNormal > 0) return;

    // Calculate impulse
    const restitution = 0.8;
    const impulse = -(1 + restitution) * velAlongNormal;
    const impulseX = impulse * nx;
    const impulseY = impulse * ny;

    // Apply impulse
    p1.vx -= impulseX / p1.mass;
    p1.vy -= impulseY / p1.mass;
    p2.vx += impulseX / p2.mass;
    p2.vy += impulseY / p2.mass;

    // Separate particles to prevent sticking
    const overlap = this.collisionRadius - distance;
    const separationX = nx * overlap * 0.5;
    const separationY = ny * overlap * 0.5;

    p1.x -= separationX;
    p1.y -= separationY;
    p2.x += separationX;
    p2.y += separationY;
  }

  createCollisionEffect(x, y, type) {
    const effectCount = type === "particle" ? 8 : 4;

    for (let i = 0; i < effectCount; i++) {
      const angle = (Math.PI * 2 * i) / effectCount;
      const speed = Math.random() * 3 + 1;

      this.addParticle(
        x + Math.cos(angle) * 5,
        y + Math.sin(angle) * 5,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.3,
        "effect"
      );
    }
  }

  createChainReaction(x, y) {
    const reactionCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < reactionCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;

      this.addParticle(
        x + Math.cos(angle) * 10,
        y + Math.sin(angle) * 10,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.5,
        "chain"
      );
    }
  }

  renderParticles(ctx) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw force fields
    this.drawForceFields(ctx);

    // Draw vortices
    this.drawVortices(ctx);

    // Draw orbital bodies
    this.drawOrbitalBodies(ctx);

    // Draw magnetic field lines
    this.drawMagneticFieldLines(ctx);

    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;

      // Draw particle with glow effect
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Draw charge indicator
      if (p.charge !== 0) {
        ctx.strokeStyle = p.charge > 0 ? "#ff4444" : "#4444ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  drawForceFields(ctx) {
    this.forceFields.forEach((field) => {
      ctx.save();
      ctx.globalAlpha = field.life * 0.3;

      if (field.type === "attract") {
        ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
      } else {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
      }

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.restore();
    });
  }

  drawVortices(ctx) {
    this.vortices.forEach((vortex) => {
      ctx.save();
      ctx.globalAlpha = vortex.life * 0.4;
      ctx.strokeStyle = "rgba(255, 165, 0, 0.6)";
      ctx.lineWidth = 3;

      // Draw spiral effect
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          vortex.x,
          vortex.y,
          (vortex.radius * (i + 1)) / 3,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  drawOrbitalBodies(ctx) {
    this.orbitalBodies.forEach((body) => {
      ctx.save();
      ctx.fillStyle = body.isCentral
        ? "rgba(255, 255, 0, 0.8)"
        : "rgba(255, 255, 255, 0.6)";
      ctx.shadowColor = body.isCentral ? "#ffff00" : "#ffffff";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawMagneticFieldLines(ctx) {
    ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
    ctx.lineWidth = 1;

    // Draw field lines between charged particles
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      if (p1.charge === 0) continue;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        if (p2.charge === 0) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150 && distance > 20) {
          const opacity = ((150 - distance) / 150) * 0.3;
          ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Add initial orbital body
    this.addOrbitalBody(this.mouseX, this.mouseY, 10, true);

    this.animate();
  }

  animate() {
    if (!this.isRunning) return;

    this.updateParticles();
    this.renderParticles(this.canvas.getContext("2d"));

    // Add new particles occasionally
    if (Math.random() < 0.15) {
      this.addParticle(
        Math.random() * window.innerWidth,
        -10,
        (Math.random() - 0.5) * 2,
        0,
        Math.random() * 0.5 + 0.5
      );
    }

    // Randomly add force fields and vortices
    if (Math.random() < 0.01) {
      this.addForceField(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        100 + Math.random() * 100,
        0.5 + Math.random() * 0.5,
        Math.random() < 0.5 ? "attract" : "repel"
      );
    }

    if (Math.random() < 0.005) {
      this.addVortex(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        80 + Math.random() * 120,
        0.3 + Math.random() * 0.4
      );
    }

    requestAnimationFrame(() => this.animate());
  }

  stop() {
    this.isRunning = false;
  }
}

// Elastic Spring System
class SpringSystem {
  constructor() {
    this.springs = [];
    this.springConstant = 0.1;
    this.damping = 0.8;
  }

  addSpring(element, targetX, targetY) {
    const spring = {
      element,
      targetX,
      targetY,
      currentX: targetX,
      currentY: targetY,
      velocityX: 0,
      velocityY: 0,
    };
    this.springs.push(spring);
  }

  updateSprings() {
    this.springs.forEach((spring) => {
      // Calculate spring force
      const dx = spring.targetX - spring.currentX;
      const dy = spring.targetY - spring.currentY;

      // Apply spring force
      spring.velocityX += dx * this.springConstant;
      spring.velocityY += dy * this.springConstant;

      // Apply damping
      spring.velocityX *= this.damping;
      spring.velocityY *= this.damping;

      // Update position
      spring.currentX += spring.velocityX;
      spring.currentY += spring.velocityY;

      // Apply to element
      spring.element.style.transform = `translate(${spring.currentX}px, ${spring.currentY}px)`;
    });
  }

  animate() {
    this.updateSprings();
    requestAnimationFrame(() => this.animate());
  }
}

// Fluid Dynamics Simulation
class FluidSimulation {
  constructor() {
    this.particles = [];
    this.grid = [];
    this.gridSize = 20;
    this.pressure = 0.1;
    this.viscosity = 0.98;
  }

  addFluidParticle(x, y) {
    const particle = {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      pressure: 0,
      density: 1,
    };
    this.particles.push(particle);
  }

  updateFluid() {
    // Update particle positions
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Apply viscosity
      p.vx *= this.viscosity;
      p.vy *= this.viscosity;

      // Boundary conditions
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -0.8;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -0.8;
    });
  }

  renderFluid(ctx) {
    ctx.fillStyle = "rgba(0, 229, 255, 0.3)";
    this.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Initialize Physics Systems
let physicsEngine, springSystem, fluidSimulation;

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Animation classes for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe all sections and animated elements
  document.querySelectorAll("section, .animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  function activateNavLink() {
    let currentSection = "";

    // Find current section in viewport
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (pageYOffset >= sectionTop - sectionHeight / 3) {
        currentSection = section.getAttribute("id");
      }
    });

    // Add/remove `active` class from nav links
    navLinks.forEach((link) => {
      link.classList.remove("active");

      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", activateNavLink);

  // Mouse move parallax effect
  let mouseX = 0;
  let mouseY = 0;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Parallax effect for hero section
    const heroSection = document.querySelector(".heroSection");
    if (heroSection) {
      const moveX = (mouseX - windowWidth / 2) * 0.01;
      const moveY = (mouseY - windowHeight / 2) * 0.01;
      heroSection.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Interactive background grid effect
    const gridLines = document.querySelectorAll(".grid-line");
    gridLines.forEach((line, index) => {
      const distance = Math.sqrt(
        Math.pow(mouseX - line.offsetLeft, 2) +
          Math.pow(mouseY - line.offsetTop, 2)
      );
      const opacity = Math.max(0, 1 - distance / 200);
      line.style.opacity = opacity * 0.3;
    });
  });

  // Window resize handler
  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Add floating particles to the page
  function createFloatingParticles() {
    const particleContainer = document.createElement("div");
    particleContainer.className = "particle-container";
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "floating-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 5 + "s";
      particle.style.animationDuration = Math.random() * 10 + 10 + "s";
      particleContainer.appendChild(particle);
    }
  }

  // Add interactive background grid
  function createInteractiveGrid() {
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";
    document.body.appendChild(gridContainer);

    // Create vertical lines
    for (let i = 0; i < 20; i++) {
      const line = document.createElement("div");
      line.className = "grid-line grid-line-vertical";
      line.style.left = i * 5 + "%";
      gridContainer.appendChild(line);
    }

    // Create horizontal lines
    for (let i = 0; i < 20; i++) {
      const line = document.createElement("div");
      line.className = "grid-line grid-line-horizontal";
      line.style.top = i * 5 + "%";
      gridContainer.appendChild(line);
    }
  }

  createFloatingParticles();
  createInteractiveGrid();

  // Add hover effects to project cards
  function addCardHoverEffects() {
    const cards = document.querySelectorAll(".project-card-glass");

    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-10px) scale(1.02)";
        this.style.boxShadow = "0 20px 40px rgba(0, 229, 255, 0.3)";
        this.classList.add("pulse");
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0) scale(1)";
        this.style.boxShadow = "0 8px 32px rgba(0, 229, 255, 0.1)";
        this.classList.remove("pulse");
      });
    });
  }

  // Add ripple effect to buttons
  function addRippleEffect() {
    const buttons = document.querySelectorAll("button, .btn, a[href]");

    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add("ripple");

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // Add subtle hover effect to headings
  function addHeadingHoverEffect() {
    const headings = document.querySelectorAll("h1, h2");

    headings.forEach((heading) => {
      heading.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.02)";
        this.style.textShadow = "0 0 20px var(--primary-glow)";
      });

      heading.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
        this.style.textShadow = "none";
      });
    });
  }

  // Initialize effects
  setTimeout(() => {
    addCardHoverEffects();
    addRippleEffect();
    addHeadingHoverEffect();
  }, 1000);

  // Add scroll-triggered animations
  function addScrollAnimations() {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    animatedElements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.2}s`;
    });
  }

  addScrollAnimations();

  // Add keyboard interaction
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentSection = document.querySelector("section.animate-in");
      if (currentSection && currentSection.nextElementSibling) {
        currentSection.nextElementSibling.scrollIntoView({
          behavior: "smooth",
        });
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentSection = document.querySelector("section.animate-in");
      if (currentSection && currentSection.previousElementSibling) {
        currentSection.previousElementSibling.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});

// Project cards creation with enhanced animations
const container = document.getElementById("projectCardsContainer");

projects.forEach((project, index) => {
  const card = document.createElement("div");
  card.className = `stack-card card-${index + 1} animate-on-scroll`;
  card.style.top = `${60 + index * 10}px`;
  card.style.zIndex = `${index + 1}`;
  card.style.animationDelay = `${index * 0.1}s`;

  card.innerHTML = `
      <div class="project-card-glass">
        <h5 class="project-title">${project.name}</h5>
        <p class="project-desc">${project.description}</p>
        <p class="project-tech"><strong>Tech:</strong> ${project.technologies.join(
          ", "
        )}</p>
        <div class="project-links">
          ${
            project.androidUrl
              ? `<a href="${project.androidUrl}" target="_blank" class="project-link">Android</a>`
              : ""
          }
          ${
            project.iosUrl
              ? `<a href="${project.iosUrl}" target="_blank" class="project-link">iOS</a>`
              : ""
          }
          ${
            project.webUrl
              ? `<a href="${project.webUrl}" target="_blank" rel="noopener" class="project-link">Website</a>`
              : ""
          }
        </div>
      </div>
    `;

  container.appendChild(card);
});

// Add floating cursor trail effect
let cursorTrail = [];
const trailLength = 20;

document.addEventListener("mousemove", (e) => {
  cursorTrail.push({ x: e.clientX, y: e.clientY });

  if (cursorTrail.length > trailLength) {
    cursorTrail.shift();
  }

  updateCursorTrail();
});

function updateCursorTrail() {
  // Remove existing trail elements
  document.querySelectorAll(".cursor-trail").forEach((el) => el.remove());

  // Create new trail elements
  cursorTrail.forEach((pos, index) => {
    const trail = document.createElement("div");
    trail.className = "cursor-trail";
    trail.style.left = pos.x + "px";
    trail.style.top = pos.y + "px";
    trail.style.opacity = (index / trailLength) * 0.5;
    trail.style.transform = `scale(${index / trailLength})`;
    document.body.appendChild(trail);

    setTimeout(() => trail.remove(), 100);
  });
}

// Download Resume functionality
function setupResumeDownload() {
  const resumeButtons = document.querySelectorAll('#downloadResumeBtn, #downloadResumeBtn2');
  
  resumeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Replace with your actual resume file path
      const resumeUrl = 'assets/resume.pdf';
      
      // Check if file exists, if not show alert
      fetch(resumeUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            // File exists, download it
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = 'Sanjay_Kumar_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // File not found
            alert('Resume file not found. Please check back soon!');
          }
        })
        .catch(error => {
          console.error('Error downloading resume:', error);
          alert('Unable to download resume. Please try again.');
        });
    });
  });
}

// Initialize resume download when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupResumeDownload();
});
