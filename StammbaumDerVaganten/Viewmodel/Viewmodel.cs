using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class Viewmodel<T> : INotifyPropertyChanged
        where T : class, new()
    {
        #region INotifyPropertyChanged
        public virtual event PropertyChangedEventHandler PropertyChanged;

        //Used by derived classes in this case
        protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged is not null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        protected T model;

        public T Model
        {
            get { return model; }
            set
            {
                if (model != value)
                {
                    model = value;
                    NotifyPropertyChanged();
                    AfterSetModel();
                }
            }
        }

        // for SelectedValuePath
        /*public string PathString
        {
            get
            {
                if (model.GetType().GetMethod("GetPathString") is not null)
                {
                    return ((dynamic)model).GetPathString();
                }
                return model.ToString();
            }
        }*/

        // for DisplayMemberPath
        public new string ToString
        {
            get { return model.ToString(); }
        }

        protected virtual void AfterSetModel()
        {

        }

        public Viewmodel()
        {

        }

        public Viewmodel(T model)
        {
            this.model = model;
        }

        //Default version, overridden (newed) by specific types if needed.
        //This is shamefully ugly! Needed because some classes that derive from DataObject need to call the non parameterless ctor to claim an id on creation.
        //I haven't figured out easily how to check this need here to call the appropriate ctor instead of manual overrides.
        protected static T CreateModelInternal(Database context)
        {
            return new T();
        }

        //Needed to reduce duplicated code for creating viewmodel with object and inserting it into data and viewmodel collections at the same time
        public static Viewmodel<T> CreateModelAndVmInContextAndAddToLists<TVm>(Database context, List<T> dataList, ObservableCollection<TVm> viewmodelCollection)
            where TVm : Viewmodel<T>, new()
        {
            T newModel = CreateModelInternal(context);
            dataList.Add(newModel);
            TVm newVm = new TVm();
            newVm.model = newModel;
            viewmodelCollection.Add(newVm);
            return newVm;
        }

        public static Viewmodel<T> CreateModelAndVmAndAddToLists<TVm>(Database context, List<T> dataList, ObservableCollection<TVm> viewmodelCollection)
            where TVm : Viewmodel<T>, new()
        {
            T newModel = CreateModelInternal(context);
            dataList.Add(newModel);
            TVm newVm = new TVm();
            newVm.model = newModel;
            viewmodelCollection.Add(newVm);
            return newVm;
        }
    }

    public class ViewmodelOfReferenceable<T> : Viewmodel<T>
        where T : Referenceable<T>, new()
    {
        public int ObjectID
        {
            get { return model.Reference.ObjectID; }
        }

        public ViewmodelOfReferenceable()
        { }

        public ViewmodelOfReferenceable(T model)
            : base(model)
        { }

        protected static new T CreateModelInternal(Database context)
        {
            return (T)Activator.CreateInstance(typeof(T), new object[] { context, true });
        }
    }
}
