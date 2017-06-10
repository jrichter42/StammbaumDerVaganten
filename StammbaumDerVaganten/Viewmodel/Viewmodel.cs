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
    public class Viewmodel<T> : INotifyPropertyChanged where T : new()
    {
        #region INotifyPropertyChanged
        public virtual event PropertyChangedEventHandler PropertyChanged;

        //Used by derived classes in this case
        protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        protected T model;

        public T Model
        {
            get { return model; }
        }

        //To set model in template function
        public void SetModel(T model)
        {
            this.model = model;
            AfterSetModel();
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

        //This is shamefully ugly! Needed because some classes that derive from DataObject need to call the non parameterless ctor to claim an id on creation.
        //I haven't figured out easily how to create specifications of methods for the generic type that comes from the class not the function as a template itself.
        protected static T CreateModelInternal()
        {
            return new T();
        }

        //Needed to reduce duplicated code for creating viewmodel with object and inserting it into data and viewmodel collections at the same time
        public static Viewmodel<T> Create<TVm>(List<T> dataList, ObservableCollection<TVm> viewmodelCollection) where TVm : Viewmodel<T>, new()
        {
            T model = CreateModelInternal();
            dataList.Add(model);
            TVm vm = new TVm();
            vm.SetModel(model);
            viewmodelCollection.Add(vm);
            return vm;
        }
    }
}
