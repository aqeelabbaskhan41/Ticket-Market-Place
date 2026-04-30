# Bugfix Requirements Document

## Introduction

When an admin adds a new section to an existing venue, that section is stored in `Venue.sections` but no corresponding `SeatCategory` document is created. As a result, when a seller creates a ticket listing and selects a match, the category dropdown is driven by the global `SeatCategory` collection (which only contains the original 8 seeded entries). The new venue section exists in `sectionImages` (derived from `venue.sections`) but is absent from `categories` (derived from `GET /api/seat-categories`), so the filter at line ~342 of `frontend/src/app/(dashboard)/seller/listings/create/page.jsx` silently excludes it. Sellers cannot select the new section as a category, making it impossible to list tickets for that section.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a match is selected and the venue has a section that is not present in the global `SeatCategory` collection THEN the system filters that section out of the category dropdown and it never appears as a selectable option

1.2 WHEN a match is selected and the venue has sections that were added after the initial seed THEN the system shows only the intersection of `categories` (global list) and `sectionImages` (venue sections), omitting any venue section not in the global list

### Expected Behavior (Correct)

2.1 WHEN a match is selected THEN the system SHALL populate the category dropdown from `Object.keys(sectionImages)` (the venue's actual sections), showing every section the venue has regardless of whether it exists in the global `SeatCategory` collection

2.2 WHEN a match is selected and the venue has a newly added section (e.g. "East Stand") THEN the system SHALL include that section as a selectable category option in the dropdown

### Unchanged Behavior (Regression Prevention)

3.1 WHEN no match is selected THEN the system SHALL CONTINUE TO populate the category dropdown from the global `categories` list (fetched from `GET /api/seat-categories`)

3.2 WHEN a match is selected and a category with a section image is chosen THEN the system SHALL CONTINUE TO display the stadium section image preview

3.3 WHEN a seller submits the listing form THEN the system SHALL CONTINUE TO validate required fields (category, blockArea, price, deliveryMethod) and submit the listing to `POST /api/tickets` unchanged

3.4 WHEN a category is selected that has no section image THEN the system SHALL CONTINUE TO show the "No section image available" warning

---

## Bug Condition

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type { selectedMatch, sectionImages, categories }
  OUTPUT: boolean

  // Bug triggers when a match is selected and the venue has sections
  // that are not present in the global categories list
  RETURN X.selectedMatch IS NOT EMPTY
    AND EXISTS key IN X.sectionImages WHERE key NOT IN X.categories
END FUNCTION
```

**Property: Fix Checking**
```pascal
FOR ALL X WHERE isBugCondition(X) DO
  renderedOptions ← categoryDropdown.options(X)
  ASSERT renderedOptions = Object.keys(X.sectionImages)
END FOR
```

**Property: Preservation Checking**
```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  // i.e. no match selected
  ASSERT F(X) = F'(X)
  // dropdown options remain the global categories list
END FOR
```
