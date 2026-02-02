import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import dashboardRoutes from "./routes/dashboard";
import profileRoutes from "./routes/profile";
import educationRoutes from "./routes/education";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "frame-ancestors": ["'self'", "http://localhost:3000", "http://localhost:3001"],
      },
    },
    frameguard: false,
  })
);

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));

app.use("/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

const uploadsPath = path.resolve(__dirname, "./public/uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath)
);

app.use(educationRoutes);

// Swagger config
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "WorkShelf API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        // --- Existing ---
        AuthResponse: {
          type: "object",
          properties: {
            access: { type: "string", description: "JWT access token" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                profile: {
                  type: "object",
                  properties: {
                    displayName: { type: "string" },
                    theme: { type: "string" },
                    locale: { type: "string" },
                    avatarUrl: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            errorCode: {
              type: "string",
              description: "Stable machine code",
              enum: [
                "err.missing_fields",
                "err.invalid_credentials",
                "err.email_in_use",
                "err.user_not_found",
                "err.password_too_short",
                "err.wrong_password",
              ],
            },
            error: { type: "string", description: "Human-readable message" },
          },
          required: ["errorCode", "error"],
        },

        // --- Enums (as schemas so you can $ref them) ---
        MaritalStatus: {
          type: "string",
          enum: ["single", "married", "divorced", "widowed", "civil_union", "other"],
        },
        Gender: {
          type: "string",
          enum: ["male", "female", "other"],
        },
        EmploymentStatus: {
          type: "string",
          enum: ["employed", "unemployed", "freelance", "student"],
        },
        DashboardTabKey: {
          type: "string",
          enum: ["overview", "experience", "certifications", "skills", "reviews"],
        },
        LanguageLevel: {
          type: "string",
          enum: ["A1", "A2", "B1", "B2", "C1", "C2", "beginner", "intermediate", "advanced", "fluent", "native_like"],
        },
        ContactType: {
          type: "string",
          enum: ["email", "phone", "website", "linkedin", "github", "twitter", "instagram", "other"],
        },

        // --- Models (flat, no relation cycles) ---
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            passwordHash: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "email", "passwordHash", "createdAt"],
        },

        Profile: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            displayName: { type: "string" },
            theme: { type: "string" },
            locale: { type: "string" },
            avatarUrl: { type: "string", nullable: true },

            fullName: { type: "string", nullable: true },
            birthDate: { type: "string", format: "date-time", nullable: true },
            nationality: { type: "string", nullable: true },
            gender: { $ref: "#/components/schemas/Gender", nullable: true },

            employmentStatus: { $ref: "#/components/schemas/EmploymentStatus", nullable: true },
            currentTitle: { type: "string", nullable: true },
            currentCompany: { type: "string", nullable: true },
            currentCompanyLogoUrl: { type: "string", nullable: true },
            currentClient: { type: "string", nullable: true },
            currentClientLogoUrl: { type: "string", nullable: true },
            currentRoleStart: { type: "string", format: "date-time", nullable: true },

            maritalStatus: { $ref: "#/components/schemas/MaritalStatus", nullable: true },
            dependents: { type: "integer", nullable: true },

            about: { type: "string", nullable: true },

            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "displayName", "theme", "locale", "createdAt", "updatedAt"],
        },

        Hobby: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            icon: { type: "string", nullable: true },
            profileId: { type: "string" },
          },
          required: ["id", "name", "profileId"],
        },

        Education: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },

            education: { type: "string", nullable: true },
            school: { type: "string" },
            schoolLogoUrl: { type: "string", nullable: true },
            degree: { type: "string", nullable: true },

            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time", nullable: true },
            isCurrent: { type: "boolean" },

            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "profileId", "school", "startDate", "isCurrent", "createdAt", "updatedAt"],
        },

        Certification: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            fileName: { type: "string" },
            mimeType: { type: "string" },
            url: { type: "string" },
            profileId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },

            badgeColor: { type: "string", nullable: true },
            iconUrl: { type: "string", nullable: true },
          },
          required: ["id", "title", "fileName", "mimeType", "url", "profileId", "createdAt"],
        },

        Review: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },
            companyName: { type: "string" },
            companyLogoUrl: { type: "string", nullable: true },
            fileName: { type: "string" },
            description: { type: "string" },
            url: { type: "string" },
            mimeType: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            reviewDate: { type: "string", format: "date-time" },
          },
          required: ["id", "profileId", "companyName", "fileName", "description", "url", "mimeType", "createdAt", "reviewDate"],
        },

        ProfileHighlight: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },
            title: { type: "string" },
            value: { type: "string" },
            icon: { type: "string", nullable: true },
            order: { type: "integer" },
          },
          required: ["id", "profileId", "title", "value", "order"],
        },

        Experience: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },

            title: { type: "string" },
            company: { type: "string" },
            companyLogoUrl: { type: "string", nullable: true },

            isConsultancy: { type: "boolean" },
            client: { type: "string", nullable: true },
            clientLogoUrl: { type: "string", nullable: true },

            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time", nullable: true },
            isCurrent: { type: "boolean" },

            description: { type: "string", nullable: true },

            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "profileId", "title", "company", "isConsultancy", "startDate", "isCurrent", "createdAt", "updatedAt"],
        },

        ExperienceTask: {
          type: "object",
          properties: {
            id: { type: "string" },
            experienceId: { type: "string" },
            text: { type: "string" },
            order: { type: "integer" },
          },
          required: ["id", "experienceId", "text", "order"],
        },

        Technology: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            iconUrl: { type: "string", nullable: true },
          },
          required: ["id", "name"],
        },

        ExperienceTechnology: {
          type: "object",
          properties: {
            experienceId: { type: "string" },
            technologyId: { type: "string" },
          },
          required: ["experienceId", "technologyId"],
        },

        Skill: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            proficiency: { type: "integer" },
            icon: { type: "string", nullable: true },
            order: { type: "integer" },

            profileId: { type: "string" },

            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name", "proficiency", "order", "profileId", "createdAt", "updatedAt"],
        },

        Language: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },
            name: { type: "string" },
            level: { $ref: "#/components/schemas/LanguageLevel" },
            isNative: { type: "boolean" },
          },
          required: ["id", "profileId", "name", "level", "isNative"],
        },

        ContactMethod: {
          type: "object",
          properties: {
            id: { type: "string" },
            profileId: { type: "string" },
            type: { $ref: "#/components/schemas/ContactType" },
            label: { type: "string", nullable: true },
            value: { type: "string" },
            icon: { type: "string", nullable: true },
            order: { type: "integer" },
          },
          required: ["id", "profileId", "type", "value", "order"],
        },

        DashboardTab: {
          type: "object",
          properties: {
            id: { type: "string" },
            key: { $ref: "#/components/schemas/DashboardTabKey" },
            label: { type: "string" },
            icon: { type: "string", nullable: true },
            order: { type: "integer" },
          },
          required: ["id", "key", "label", "order"],
        },

        DashboardTile: {
          type: "object",
          properties: {
            id: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            icon: { type: "string", nullable: true },
            order: { type: "integer" },
            tabId: { type: "string" },
          },
          required: ["id", "category", "description", "order", "tabId"],
        },
      },
    },
  },
  apis: ["src/routes/**/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, service: "workshelf-api" }));

app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));