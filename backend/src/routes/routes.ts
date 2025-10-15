/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/UserController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SystemController } from './../controllers/SystemController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SlotController } from './../controllers/SlotController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionController } from './../controllers/SessionController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ParkingController } from './../controllers/ParkingController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationController } from './../controllers/NotificationController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DashboardController } from './../controllers/DashboardController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BillingController } from './../controllers/BillingController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/AuthController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AnalyticsController } from './../controllers/AnalyticsController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "UserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.string-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"array","array":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnumResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"Record_string.string-Array_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConfigResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"systemConfig":{"dataType":"nestedObjectLiteral","nestedProperties":{"supportedFeatures":{"dataType":"array","array":{"dataType":"string"},"required":true},"defaultBillingType":{"dataType":"string","required":true},"apiVersion":{"dataType":"string","required":true}},"required":true},"enums":{"dataType":"nestedObjectLiteral","nestedProperties":{"billingTypes":{"dataType":"array","array":{"dataType":"string"},"required":true},"sessionStatuses":{"dataType":"array","array":{"dataType":"string"},"required":true},"slotStatuses":{"dataType":"array","array":{"dataType":"string"},"required":true},"slotTypes":{"dataType":"array","array":{"dataType":"string"},"required":true},"vehicleTypes":{"dataType":"array","array":{"dataType":"string"},"required":true}},"required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SlotResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSlotRequest": {
        "dataType": "refObject",
        "properties": {
            "slotNumber": {"dataType":"string","required":true},
            "slotType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateSlotRequest": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AVAILABLE"]},{"dataType":"enum","enums":["OCCUPIED"]},{"dataType":"enum","enums":["MAINTENANCE"]}]},
            "slotType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AutoAssignResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "slot": {"dataType":"nestedObjectLiteral","nestedProperties":{"slotType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true},"slotNumber":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AutoAssignRequest": {
        "dataType": "refObject",
        "properties": {
            "vehicleType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SessionResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExtendSessionRequest": {
        "dataType": "refObject",
        "properties": {
            "sessionId": {"dataType":"string","required":true},
            "billingType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VehicleEntryResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"billingType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},"entryTime":{"dataType":"datetime","required":true},"slotNumber":{"dataType":"string","required":true},"slotId":{"dataType":"string","required":true},"vehicleId":{"dataType":"string","required":true},"sessionId":{"dataType":"string","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VehicleEntryRequest": {
        "dataType": "refObject",
        "properties": {
            "numberPlate": {"dataType":"string","required":true},
            "vehicleType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true},
            "billingType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},
            "slotId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchVehicleResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"parkingHistory":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"duration":{"dataType":"string","required":true},"billingAmount":{"dataType":"double","required":true},"exitTime":{"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},"entryTime":{"dataType":"datetime","required":true},"slotNumber":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"required":true},"currentSession":{"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"dataType":"string","required":true},"billingType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},"entryTime":{"dataType":"datetime","required":true},"slotNumber":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"vehicle":{"dataType":"nestedObjectLiteral","nestedProperties":{"vehicleType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true},"numberPlate":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VehicleExitResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"billingType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},"billingAmount":{"dataType":"double","required":true},"duration":{"dataType":"string","required":true},"exitTime":{"dataType":"datetime","required":true},"entryTime":{"dataType":"datetime","required":true},"sessionId":{"dataType":"string","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VehicleExitRequest": {
        "dataType": "refObject",
        "properties": {
            "numberPlate": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SlotOverrideResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"billingType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},"entryTime":{"dataType":"datetime","required":true},"newSlot":{"dataType":"nestedObjectLiteral","nestedProperties":{"slotType":{"dataType":"string","required":true},"slotNumber":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true},"oldSlot":{"dataType":"nestedObjectLiteral","nestedProperties":{"slotType":{"dataType":"string","required":true},"slotNumber":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true},"vehicleNumberPlate":{"dataType":"string","required":true},"sessionId":{"dataType":"string","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SlotOverrideRequest": {
        "dataType": "refObject",
        "properties": {
            "newSlotId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotificationResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardStats": {
        "dataType": "refObject",
        "properties": {
            "totalSlots": {"dataType":"double","required":true},
            "occupiedSlots": {"dataType":"double","required":true},
            "availableSlots": {"dataType":"double","required":true},
            "maintenanceSlots": {"dataType":"double","required":true},
            "occupancyRate": {"dataType":"double","required":true},
            "slotsByType": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"maintenance":{"dataType":"double","required":true},"available":{"dataType":"double","required":true},"occupied":{"dataType":"double","required":true},"total":{"dataType":"double","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true}}},"required":true},
            "vehiclesByType": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"percentage":{"dataType":"double","required":true},"count":{"dataType":"double","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}],"required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RevenueStats": {
        "dataType": "refObject",
        "properties": {
            "today": {"dataType":"double","required":true},
            "thisWeek": {"dataType":"double","required":true},
            "thisMonth": {"dataType":"double","required":true},
            "byBillingType": {"dataType":"nestedObjectLiteral","nestedProperties":{"dayPass":{"dataType":"double","required":true},"hourly":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityStats": {
        "dataType": "refObject",
        "properties": {
            "entriesLastHour": {"dataType":"double","required":true},
            "exitsLastHour": {"dataType":"double","required":true},
            "averageParkingDuration": {"dataType":"string","required":true},
            "peakHours": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"entries":{"dataType":"double","required":true},"hour":{"dataType":"double","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BillingConfigResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"currency":{"dataType":"string","required":true},"dayPassRate":{"dataType":"double","required":true},"hourlyRates":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"rate":{"dataType":"double","required":true},"maxHours":{"dataType":"double","required":true},"minHours":{"dataType":"double","required":true}}},"required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BillingPreviewResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"dayPass":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string","required":true},"rate":{"dataType":"double","required":true}},"required":true},"hourlyRates":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string","required":true},"rate":{"dataType":"double","required":true},"duration":{"dataType":"string","required":true}}},"required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CostEstimateResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"currency":{"dataType":"string","required":true},"durationHours":{"dataType":"double","required":true},"estimatedAmount":{"dataType":"double","required":true},"currentDuration":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CostEstimateRequest": {
        "dataType": "refObject",
        "properties": {
            "entryTime": {"dataType":"string","required":true},
            "billingType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SendOTPResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "otp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SendOTPRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyOTPResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "user": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"dataType":"datetime","required":true},"email":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},
            "token": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyOTPRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "otp": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthUser": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "user": {"ref":"AuthUser"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalyticsResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUserController_getUsers: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/users',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUsers)),

            async function UserController_getUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/api/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUser)),

            async function UserController_getUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateUserRequest"},
        };
        app.post('/api/users',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            async function UserController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_createUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateUserRequest"},
        };
        app.put('/api/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            async function UserController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.delete('/api/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            async function UserController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getEnums: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/system/enums',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getEnums)),

            async function SystemController_getEnums(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getEnums, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getEnums',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getSystemConfig: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/system/config',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getSystemConfig)),

            async function SystemController_getSystemConfig(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getSystemConfig, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getSystemConfig',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getVehicleTypes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/system/vehicle-types',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getVehicleTypes)),

            async function SystemController_getVehicleTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getVehicleTypes, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getVehicleTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getSlotTypes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/system/slot-types',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getSlotTypes)),

            async function SystemController_getSlotTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getSlotTypes, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getSlotTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getBillingTypes: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/system/billing-types',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getBillingTypes)),

            async function SystemController_getBillingTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getBillingTypes, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getBillingTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_getSlots: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["AVAILABLE"]},{"dataType":"enum","enums":["OCCUPIED"]},{"dataType":"enum","enums":["MAINTENANCE"]}]},
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":50,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/slots',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.getSlots)),

            async function SlotController_getSlots(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_getSlots, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'getSlots',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_getAvailabilityMap: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/slots/availability-map',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.getAvailabilityMap)),

            async function SlotController_getAvailabilityMap(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_getAvailabilityMap, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'getAvailabilityMap',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_getAvailableSlots: Record<string, TsoaRoute.ParameterSchema> = {
                vehicleType: {"in":"query","name":"vehicleType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
        };
        app.get('/api/slots/available',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.getAvailableSlots)),

            async function SlotController_getAvailableSlots(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_getAvailableSlots, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'getAvailableSlots',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_getSlotById: Record<string, TsoaRoute.ParameterSchema> = {
                slotId: {"in":"path","name":"slotId","required":true,"dataType":"string"},
        };
        app.get('/api/slots/:slotId',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.getSlotById)),

            async function SlotController_getSlotById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_getSlotById, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'getSlotById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_createSlot: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateSlotRequest"},
        };
        app.post('/api/slots',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.createSlot)),

            async function SlotController_createSlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_createSlot, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'createSlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_updateSlot: Record<string, TsoaRoute.ParameterSchema> = {
                slotId: {"in":"path","name":"slotId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateSlotRequest"},
        };
        app.put('/api/slots/:slotId',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.updateSlot)),

            async function SlotController_updateSlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_updateSlot, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'updateSlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_autoAssignSlot: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"AutoAssignRequest"},
        };
        app.post('/api/slots/auto-assign',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.autoAssignSlot)),

            async function SlotController_autoAssignSlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_autoAssignSlot, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'autoAssignSlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_setSlotMaintenance: Record<string, TsoaRoute.ParameterSchema> = {
                slotId: {"in":"path","name":"slotId","required":true,"dataType":"string"},
        };
        app.post('/api/slots/:slotId/maintenance',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.setSlotMaintenance)),

            async function SlotController_setSlotMaintenance(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_setSlotMaintenance, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'setSlotMaintenance',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_releaseSlotMaintenance: Record<string, TsoaRoute.ParameterSchema> = {
                slotId: {"in":"path","name":"slotId","required":true,"dataType":"string"},
        };
        app.post('/api/slots/:slotId/release-maintenance',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.releaseSlotMaintenance)),

            async function SlotController_releaseSlotMaintenance(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_releaseSlotMaintenance, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'releaseSlotMaintenance',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_reserveSlot: Record<string, TsoaRoute.ParameterSchema> = {
                slotId: {"in":"path","name":"slotId","required":true,"dataType":"string"},
        };
        app.post('/api/slots/:slotId/reserve',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.reserveSlot)),

            async function SlotController_reserveSlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_reserveSlot, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'reserveSlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSlotController_bulkCreateSlots: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"array","array":{"dataType":"refObject","ref":"CreateSlotRequest"}},
        };
        app.post('/api/slots/bulk',
            ...(fetchMiddlewares<RequestHandler>(SlotController)),
            ...(fetchMiddlewares<RequestHandler>(SlotController.prototype.bulkCreateSlots)),

            async function SlotController_bulkCreateSlots(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSlotController_bulkCreateSlots, request, response });

                const controller = new SlotController();

              await templateService.apiHandler({
                methodName: 'bulkCreateSlots',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getActiveSessions: Record<string, TsoaRoute.ParameterSchema> = {
                vehicleType: {"in":"query","name":"vehicleType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/sessions/active',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getActiveSessions)),

            async function SessionController_getActiveSessions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getActiveSessions, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getActiveSessions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getSessionById: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.get('/api/sessions/:sessionId',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionById)),

            async function SessionController_getSessionById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getSessionById, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getSessionById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getSessionByVehicle: Record<string, TsoaRoute.ParameterSchema> = {
                numberPlate: {"in":"path","name":"numberPlate","required":true,"dataType":"string"},
        };
        app.get('/api/sessions/vehicle/:numberPlate',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionByVehicle)),

            async function SessionController_getSessionByVehicle(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getSessionByVehicle, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getSessionByVehicle',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_extendSession: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"ExtendSessionRequest"},
        };
        app.post('/api/sessions/extend',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.extendSession)),

            async function SessionController_extendSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_extendSession, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'extendSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getSessionHistory: Record<string, TsoaRoute.ParameterSchema> = {
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                vehicleType: {"in":"query","name":"vehicleType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["COMPLETED"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/sessions/history',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionHistory)),

            async function SessionController_getSessionHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getSessionHistory, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getSessionHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_calculateSessionCost: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.get('/api/sessions/:sessionId/cost',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.calculateSessionCost)),

            async function SessionController_calculateSessionCost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_calculateSessionCost, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'calculateSessionCost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_forceEndSession: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.post('/api/sessions/:sessionId/force-end',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.forceEndSession)),

            async function SessionController_forceEndSession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_forceEndSession, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'forceEndSession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getSessionStats: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/sessions/stats',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionStats)),

            async function SessionController_getSessionStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getSessionStats, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getSessionStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_getOverstayAlerts: Record<string, TsoaRoute.ParameterSchema> = {
                thresholdHours: {"default":24,"in":"query","name":"thresholdHours","dataType":"double"},
        };
        app.get('/api/sessions/overstay-alerts',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getOverstayAlerts)),

            async function SessionController_getOverstayAlerts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getOverstayAlerts, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getOverstayAlerts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_registerVehicleEntry: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"VehicleEntryRequest"},
        };
        app.post('/api/parking/entry',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.registerVehicleEntry)),

            async function ParkingController_registerVehicleEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_registerVehicleEntry, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'registerVehicleEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_searchVehicle: Record<string, TsoaRoute.ParameterSchema> = {
                numberPlate: {"in":"path","name":"numberPlate","required":true,"dataType":"string"},
        };
        app.get('/api/parking/search/:numberPlate',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.searchVehicle)),

            async function ParkingController_searchVehicle(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_searchVehicle, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'searchVehicle',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_quickSearch: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
        };
        app.get('/api/parking/quick-search',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.quickSearch)),

            async function ParkingController_quickSearch(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_quickSearch, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'quickSearch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_registerVehicleExit: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"VehicleExitRequest"},
        };
        app.post('/api/parking/exit',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.registerVehicleExit)),

            async function ParkingController_registerVehicleExit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_registerVehicleExit, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'registerVehicleExit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_getCurrentlyParkedVehicles: Record<string, TsoaRoute.ParameterSchema> = {
                vehicleType: {"in":"query","name":"vehicleType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/parking/current',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.getCurrentlyParkedVehicles)),

            async function ParkingController_getCurrentlyParkedVehicles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_getCurrentlyParkedVehicles, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'getCurrentlyParkedVehicles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_getParkingHistory: Record<string, TsoaRoute.ParameterSchema> = {
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                vehicleType: {"in":"query","name":"vehicleType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["CAR"]},{"dataType":"enum","enums":["BIKE"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/parking/history',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.getParkingHistory)),

            async function ParkingController_getParkingHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_getParkingHistory, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'getParkingHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsParkingController_overrideSlot: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SlotOverrideRequest"},
        };
        app.post('/api/parking/:sessionId/override-slot',
            ...(fetchMiddlewares<RequestHandler>(ParkingController)),
            ...(fetchMiddlewares<RequestHandler>(ParkingController.prototype.overrideSlot)),

            async function ParkingController_overrideSlot(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsParkingController_overrideSlot, request, response });

                const controller = new ParkingController();

              await templateService.apiHandler({
                methodName: 'overrideSlot',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getNotifications: Record<string, TsoaRoute.ParameterSchema> = {
                unreadOnly: {"in":"query","name":"unreadOnly","dataType":"boolean"},
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["overstay"]},{"dataType":"enum","enums":["revenue"]},{"dataType":"enum","enums":["system"]},{"dataType":"enum","enums":["maintenance"]}]},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/notifications',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getNotifications)),

            async function NotificationController_getNotifications(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getNotifications, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getNotifications',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getNotificationCount: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/notifications/count',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getNotificationCount)),

            async function NotificationController_getNotificationCount(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getNotificationCount, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getNotificationCount',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_markNotificationAsRead: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
        };
        app.post('/api/notifications/:notificationId/mark-read',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.markNotificationAsRead)),

            async function NotificationController_markNotificationAsRead(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_markNotificationAsRead, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'markNotificationAsRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_markAllNotificationsAsRead: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/api/notifications/mark-all-read',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.markAllNotificationsAsRead)),

            async function NotificationController_markAllNotificationsAsRead(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_markAllNotificationsAsRead, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'markAllNotificationsAsRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_runOverstayDetection: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/api/notifications/run-overstay-detection',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.runOverstayDetection)),

            async function NotificationController_runOverstayDetection(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_runOverstayDetection, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'runOverstayDetection',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getDashboardStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/dashboard/stats',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getDashboardStats)),

            async function DashboardController_getDashboardStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getDashboardStats, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getDashboardStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getRevenueStats: Record<string, TsoaRoute.ParameterSchema> = {
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/dashboard/revenue',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getRevenueStats)),

            async function DashboardController_getRevenueStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getRevenueStats, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getRevenueStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getActivityStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/dashboard/activity',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getActivityStats)),

            async function DashboardController_getActivityStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getActivityStats, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getActivityStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getOccupancyTrends: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/dashboard/occupancy-trends',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getOccupancyTrends)),

            async function DashboardController_getOccupancyTrends(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getOccupancyTrends, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getOccupancyTrends',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getRealtimeUpdates: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/dashboard/realtime',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getRealtimeUpdates)),

            async function DashboardController_getRealtimeUpdates(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getRealtimeUpdates, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getRealtimeUpdates',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDashboardController_getSlotAvailability: Record<string, TsoaRoute.ParameterSchema> = {
                slotType: {"in":"query","name":"slotType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["REGULAR"]},{"dataType":"enum","enums":["COMPACT"]},{"dataType":"enum","enums":["EV"]},{"dataType":"enum","enums":["HANDICAP_ACCESSIBLE"]}]},
        };
        app.get('/api/dashboard/slot-availability',
            ...(fetchMiddlewares<RequestHandler>(DashboardController)),
            ...(fetchMiddlewares<RequestHandler>(DashboardController.prototype.getSlotAvailability)),

            async function DashboardController_getSlotAvailability(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getSlotAvailability, request, response });

                const controller = new DashboardController();

              await templateService.apiHandler({
                methodName: 'getSlotAvailability',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_getBillingConfig: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/billing/config',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.getBillingConfig)),

            async function BillingController_getBillingConfig(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_getBillingConfig, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'getBillingConfig',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_getBillingRates: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/billing/rates',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.getBillingRates)),

            async function BillingController_getBillingRates(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_getBillingRates, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'getBillingRates',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_calculateCostEstimate: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CostEstimateRequest"},
        };
        app.post('/api/billing/estimate',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.calculateCostEstimate)),

            async function BillingController_calculateCostEstimate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_calculateCostEstimate, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'calculateCostEstimate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_calculateBilling: Record<string, TsoaRoute.ParameterSchema> = {
                entryTime: {"in":"query","name":"entryTime","required":true,"dataType":"string"},
                exitTime: {"in":"query","name":"exitTime","required":true,"dataType":"string"},
                billingType: {"in":"query","name":"billingType","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HOURLY"]},{"dataType":"enum","enums":["DAY_PASS"]}]},
        };
        app.get('/api/billing/calculate',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.calculateBilling)),

            async function BillingController_calculateBilling(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_calculateBilling, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'calculateBilling',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_sendRegisterOTP: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SendOTPRequest"},
        };
        app.post('/api/auth/send-register-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.sendRegisterOTP)),

            async function AuthController_sendRegisterOTP(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_sendRegisterOTP, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'sendRegisterOTP',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyRegisterOTP: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"VerifyOTPRequest"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/auth/verify-register-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyRegisterOTP)),

            async function AuthController_verifyRegisterOTP(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyRegisterOTP, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyRegisterOTP',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_sendLoginOTP: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SendOTPRequest"},
        };
        app.post('/api/auth/send-login-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.sendLoginOTP)),

            async function AuthController_sendLoginOTP(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_sendLoginOTP, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'sendLoginOTP',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyLoginOTP: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"VerifyOTPRequest"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/auth/verify-login-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyLoginOTP)),

            async function AuthController_verifyLoginOTP(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyLoginOTP, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyLoginOTP',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_getCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/auth/me',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.getCurrentUser)),

            async function AuthController_getCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_getCurrentUser, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'getCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getRevenueAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/analytics/revenue',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getRevenueAnalytics)),

            async function AnalyticsController_getRevenueAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getRevenueAnalytics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getRevenueAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getSlotUtilizationAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/analytics/utilization',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getSlotUtilizationAnalytics)),

            async function AnalyticsController_getSlotUtilizationAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getSlotUtilizationAnalytics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getSlotUtilizationAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getPeakHoursAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/analytics/peak-hours',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getPeakHoursAnalytics)),

            async function AnalyticsController_getPeakHoursAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getPeakHoursAnalytics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getPeakHoursAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getVehicleTypeAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/analytics/vehicle-types',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getVehicleTypeAnalytics)),

            async function AnalyticsController_getVehicleTypeAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getVehicleTypeAnalytics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getVehicleTypeAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getOperationalMetrics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/analytics/operational-metrics',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getOperationalMetrics)),

            async function AnalyticsController_getOperationalMetrics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getOperationalMetrics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getOperationalMetrics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getOverstayAlerts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/analytics/overstay-alerts',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getOverstayAlerts)),

            async function AnalyticsController_getOverstayAlerts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getOverstayAlerts, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getOverstayAlerts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getOverstayStats: Record<string, TsoaRoute.ParameterSchema> = {
                periodDays: {"default":7,"in":"query","name":"periodDays","dataType":"double"},
        };
        app.get('/api/analytics/overstay-stats',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getOverstayStats)),

            async function AnalyticsController_getOverstayStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getOverstayStats, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getOverstayStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnalyticsController_getDashboardAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                period: {"default":"day","in":"query","name":"period","dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}]},
        };
        app.get('/api/analytics/dashboard',
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController)),
            ...(fetchMiddlewares<RequestHandler>(AnalyticsController.prototype.getDashboardAnalytics)),

            async function AnalyticsController_getDashboardAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnalyticsController_getDashboardAnalytics, request, response });

                const controller = new AnalyticsController();

              await templateService.apiHandler({
                methodName: 'getDashboardAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
