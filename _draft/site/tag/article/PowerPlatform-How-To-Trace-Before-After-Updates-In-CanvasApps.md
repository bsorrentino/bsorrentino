
## Abstract

Continuing my experience with [Microsoft Power Platform](https://powerplatform.microsoft.com/en-us/) I've dealt with implementing a sort of audit (who, What, When) during patch of Datasource from a canvas application



```yaml
BrowseGallery1 As gallery.BrowseLayout_Vertical_TwoTextOneImageVariant_pcfCore:
    OnSelect: |-
        =UpdateContext({itemSelected:true}); Set(CurrentItem,ThisItem);
```

```yaml
sc01_Icon_Submit As icon.Check:
    OnSelect: |-
        =// Before
        Trace( JSON( DropColumns( Table(CurrentItem), "_ownerid_value" ) ), TraceSeverity.Information );
        // After
        Trace( JSON( DropColumns( Table(scr01_EditForm.Updates), "_ownerid_value" ) ), TraceSeverity.Information );
        SubmitForm(scr01_EditForm)
```
