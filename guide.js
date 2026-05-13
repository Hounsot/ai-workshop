const state = {
  os: null,
  device: null,
  install: null,
  accounts: null,
  vpn: null,
};

const routeConfig = {
  os: {
    macos: {
      title: "Маршрут для участника на macOS",
      sections: ["macos", "access", "cursor", "final-check"],
    },
    windows: {
      title: "Маршрут для участника на Windows",
      sections: ["windows", "access", "cursor", "final-check"],
    },
  },
  device: {
    personal: {
      description: "Личное устройство подходит для воркшопа.",
      sections: [],
    },
    work: {
      description: "Рабочее устройство не подойдет. Для воркшопа нужен личный компьютер.",
      sections: [],
    },
  },
  install: {
    self: {
      description: "Админские права есть, значит вы сможете поставить нужные инструменты.",
      sections: [],
    },
    it: {
      description: "Админские права обязательны. Без них установка Cursor может не пройти.",
      sections: [],
    },
  },
  accounts: {
    ready: {
      description: "Аккаунты готовы.",
      sections: [],
    },
    missing: {
      description: "Нужно подготовить Cursor, GitHub и при необходимости Figma.",
      sections: ["access"],
    },
  },
  vpn: {
    ready: {
      description: "VPN готов на личном устройстве.",
      sections: [],
    },
    missing: {
      description: "VPN нужно подготовить заранее на личном устройстве.",
      sections: ["access"],
    },
  },
};

const routeTitle = document.querySelector("#route-title");
const routeDescription = document.querySelector("#route-description");
const routeSteps = document.querySelector("#route-steps");
const routeResult = document.querySelector("#route-result");
const choiceGroups = document.querySelectorAll("[data-choice-group]");
const afterDeviceCards = document.querySelectorAll("[data-after-device]");
const routeSections = document.querySelectorAll(".route-section");
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

function setChoice(groupName, value, button) {
  state[groupName] = value;

  if (groupName === "device" && value === "work") {
    state.os = null;
    state.install = null;
    state.accounts = null;
    state.vpn = null;

    afterDeviceCards.forEach((card) => {
      card.querySelectorAll(".choice-chip").forEach((chip) => chip.classList.remove("is-selected"));
    });
  }

  const group = button.closest(".choice-group");
  group.querySelectorAll(".choice-chip").forEach((chip) => {
    chip.classList.toggle("is-selected", chip === button);
  });

  updateRoute();
}

function buildSteps() {
  const steps = [];
  const emphasizedSections = new Set();

  if (state.install === "it") {
    steps.push({
      label: "Получите админские права заранее: они обязательны для установки Cursor.",
      href: "#macos",
    });
  }

  if (state.os === "macos") {
    steps.push({
      label: "Пройдите инструкцию для macOS: установка Cursor и проверка Agent.",
      href: "#macos",
    });
    routeConfig.os.macos.sections.forEach((section) => emphasizedSections.add(section));
  }

  if (state.os === "windows") {
    steps.push({
      label: "Пройдите инструкцию для Windows: установка Cursor и проверка Editor/Agent.",
      href: "#windows",
    });
    routeConfig.os.windows.sections.forEach((section) => emphasizedSections.add(section));
  }

  if (state.accounts === "missing") {
    steps.push({
      label: "Создайте аккаунт Cursor, оформите Pro, зарегистрируйтесь на GitHub и проверьте доступ к Figma.",
      href: "#access",
    });
    emphasizedSections.add("access");
  }

  if (state.vpn === "missing") {
    steps.push({
      label: "Подготовьте VPN на личном устройстве.",
      href: "#access",
    });
    emphasizedSections.add("access");
  }

  if (state.accounts === "ready" && state.vpn === "ready") {
    steps.push({
      label: "Откройте проект и убедитесь, что Cursor отвечает в Editor и Agent.",
      href: "#cursor",
    });
    emphasizedSections.add("cursor");
  }

  steps.push({
    label: "Пройдите финальный чек перед воркшопом.",
    href: "#final-check",
  });
  emphasizedSections.add("final-check");

  return { steps, emphasizedSections };
}

function updateRoute() {
  const selections = Object.values(state).filter(Boolean).length;
  const isWorkDevice = state.device === "work";

  afterDeviceCards.forEach((card) => {
    card.classList.toggle("is-hidden", isWorkDevice);
  });

  if (!selections) {
    routeTitle.textContent = "Выберите сценарий выше";
    routeDescription.textContent =
      "После выбора мы покажем, готовы ли вы к воркшопу.";
    routeSteps.innerHTML = "";
    routeResult.classList.remove("is-warning");
    routeSections.forEach((section) => {
      section.classList.remove("is-emphasized", "is-dimmed");
    });
    return;
  }

  if (isWorkDevice) {
    routeTitle.textContent = "Рабочее устройство не подойдет";
    routeDescription.textContent =
      "Для участия нужен личный компьютер. На рабочем устройстве нельзя ставить VPN, могут быть ограничения на установку Cursor и доступ к AI-сервисам.";
    routeSteps.innerHTML = "<li>Возьмите личный ноутбук и пройдите проверку заново.</li>";
    routeResult.classList.add("is-warning");
    routeSections.forEach((section) => {
      section.classList.remove("is-emphasized");
      section.classList.add("is-dimmed");
    });
    return;
  }

  routeResult.classList.remove("is-warning");

  const osText = state.os === "macos" ? "macOS" : state.os === "windows" ? "Windows" : "не выбрана";

  const descriptions = [];
  if (state.device && routeConfig.device[state.device]) {
    descriptions.push(routeConfig.device[state.device].description);
  }
  if (state.install && routeConfig.install[state.install]) {
    descriptions.push(routeConfig.install[state.install].description);
  }
  if (state.accounts && routeConfig.accounts[state.accounts]) {
    descriptions.push(routeConfig.accounts[state.accounts].description);
  }
  if (state.vpn && routeConfig.vpn[state.vpn]) {
    descriptions.push(routeConfig.vpn[state.vpn].description);
  }

  const allReady =
    state.os &&
    state.device === "personal" &&
    state.install === "self" &&
    state.accounts === "ready" &&
    state.vpn === "ready";

  if (allReady) {
    routeTitle.textContent = `Все готово для ${osText}`;
    routeDescription.textContent =
      "Отлично, вы готовы к обучению. Увидимся на воркшопе.";
  } else {
    routeTitle.textContent = `Проверка готовности: ${osText}`;
    routeDescription.textContent = descriptions.join(" ");
  }

  const { steps, emphasizedSections } = buildSteps();

  routeSteps.innerHTML = allReady
    ? `<li>Можно больше ничего не настраивать. Перед стартом просто откройте Cursor и подключитесь к трансляции.</li>`
    : steps
    .map(
      (step) =>
        `<li><a href="${step.href}">${step.label}</a></li>`
    )
    .join("");

  routeSections.forEach((section) => {
    const isRelevant = emphasizedSections.has(section.id);
    section.classList.toggle("is-emphasized", isRelevant);
    section.classList.toggle("is-dimmed", !isRelevant && emphasizedSections.size > 0);
  });
}

choiceGroups.forEach((group) => {
  const groupName = group.dataset.choiceGroup;
  group.querySelectorAll(".choice-chip").forEach((button) => {
    button.addEventListener("click", () => setChoice(groupName, button.dataset.value, button));
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sidebarLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0.01,
  }
);

document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));

updateRoute();
