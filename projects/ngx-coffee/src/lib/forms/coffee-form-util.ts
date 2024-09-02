import { FormControl, FormGroup } from "@angular/forms";

export class CoffeeFormUtil {
    /**
     * Ensure that the form is validated
     */
    validateForm(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
                control.updateValueAndValidity();
            } else if (control instanceof FormGroup) {
                this.validateForm(control);
            }
        });
    }
}