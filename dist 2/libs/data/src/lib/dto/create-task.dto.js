"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const task_status_enum_1 = require("../enums/task-status.enum");
const task_category_enum_1 = require("../enums/task-category.enum");
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_status_enum_1.TaskStatus),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_category_enum_1.TaskCategory),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "category", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateTaskDto.prototype, "assignedToId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateTaskDto.prototype, "order", void 0);
//# sourceMappingURL=create-task.dto.js.map