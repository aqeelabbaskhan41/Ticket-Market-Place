# Bugfix Requirements Document

## Introduction

In the buyer panel's "Become a Seller" modal, every input field loses focus and resets after a single character is typed. This makes it impossible for users to fill in the form, completely blocking the seller registration flow. The root cause is that the `Field` component is defined inside `BecomeSellerModal`, causing React to treat it as a new component type on every render triggered by `setFormData`, which unmounts and remounts the input element.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user types a character into any input field in the "Become a Seller" modal THEN the system loses focus on that input and discards all previously typed characters, leaving the field empty after each keystroke.

1.2 WHEN `setFormData` is called (on any keystroke) THEN the system re-renders `BecomeSellerModal`, recreates the `Field` component definition as a new type, and causes React to unmount and remount the input element.

### Expected Behavior (Correct)

2.1 WHEN a user types a character into any input field in the "Become a Seller" modal THEN the system SHALL retain focus on that input and accumulate the typed characters so the user can complete the field normally.

2.2 WHEN `setFormData` is called (on any keystroke) THEN the system SHALL re-render the existing input element in place without unmounting it, preserving focus and the current value.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits the form with a valid business name THEN the system SHALL CONTINUE TO send the form data to the `/roles/request-seller` endpoint and invoke `onSuccess` on a successful response.

3.2 WHEN a user submits the form without a business name THEN the system SHALL CONTINUE TO display the "Business name is required" validation error without submitting.

3.3 WHEN a user clicks the Cancel button or the backdrop THEN the system SHALL CONTINUE TO close the modal by invoking `onClose`.

3.4 WHEN the modal is open THEN the system SHALL CONTINUE TO prevent body scroll and render the modal via a React portal attached to `document.body`.
