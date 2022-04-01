using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class GroupPhaseVm : Viewmodel<GroupPhase>
    {
        public GroupType Type
        {
            get { return model.Type.Latest; }
            set
            {
                if (model.Type.Latest != value)
                {
                    model.Type.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string CustomType
        {
            get { return model.CustomType.Latest; }
            set
            {
                if (model.CustomType.Latest != value)
                {
                    model.CustomType.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        protected TimespanVm timespanVm;
        public TimespanVm Timespan
        {
            get { return timespanVm; }
            set
            {
                if (timespanVm != value)
                {
                    timespanVm = value;
                    model.Timespan = timespanVm.Model;
                    NotifyPropertyChanged();
                }
            }
        }

        #region FilteredTimepoints
        protected ObservableCollection<TimepointVm> filteredTimepoints;

        public ObservableCollection<TimepointVm> FilteredTimepoints
        {
            get
            {
                if (filteredTimepoints is null)
                {
                    filteredTimepoints = new ObservableCollection<TimepointVm>();
                }

                Data data = MainViewmodel.ActiveData;
                if (data is not null && (data.Timepoints.Count + 1) != filteredTimepoints.Count)
                {
                    UpdateFilteredTimepoints();
                }
                return filteredTimepoints;
            }
        }

        protected virtual void UpdateFilteredTimepoints()
        {
            filteredTimepoints.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm is null)
            {
                return;
            }

            ObservableCollection<TimepointVm> timepoints = vm.Timepoints;
            if (timepoints is null)
            {
                return;
            }

            foreach (TimepointVm t in timepoints)
            {
                filteredTimepoints.Add(t);
            }

            //Sort by date, youngest timepoint first
            int newIdx;
            for (int i = 1; i < filteredTimepoints.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (filteredTimepoints[i].Date.Year <= filteredTimepoints[newIdx].Date.Year)
                {
                    continue;
                }
                while (newIdx > 0 && filteredTimepoints[i].Date.Year > filteredTimepoints[newIdx - 1].Date.Year)
                {
                    newIdx--;
                }
                filteredTimepoints.Move(i, newIdx);
            }

            //Insert reset item
            filteredTimepoints.Insert(0, TimepointVm.INVALID);
        }
        #endregion

        public GroupPhaseVm()
        { }

        public GroupPhaseVm(GroupPhase groupPhase)
            : base(groupPhase)
        {
            timespanVm = new TimespanVm(groupPhase.Timespan);
        }
    }

    public class GroupVm : ViewmodelOfReferenceable<Group>
    {
        protected GroupPhaseVm mainPhase;
        protected ObservableCollection<GroupPhaseVm> additionalPhases;

        public string Name
        {
            get { return model.Name.Latest; }
            set
            {
                if (model.Name.Latest != value)
                {
                    model.Name.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return model.Comment.Latest; }
            set
            {
                if (model.Comment.Latest != value)
                {
                    model.Comment.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupPhaseVm MainPhase
        {
            get { return mainPhase; }
            set
            {
                if (mainPhase != value)
                {
                    mainPhase = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<GroupPhaseVm> AdditionalPhases
        {
            get { return additionalPhases; }
            set
            {
                if (additionalPhases != value)
                {
                    additionalPhases = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region FilteredTimepoints
        public ObservableCollection<TimepointVm> FilteredTimepoints
        {
            get { return mainPhase.FilteredTimepoints; }
        }
        #endregion

        public GroupVm()
        { }

        public GroupVm(Group group)
            : base(group)
        { }

        protected override void AfterSetModel()
        {
            base.AfterSetModel();

            GroupPhase mainPhase = model.MainPhase;
            this.mainPhase = new GroupPhaseVm(mainPhase);

            additionalPhases = new ObservableCollection<GroupPhaseVm>();
            for (int i = 0; i < model.AdditionalPhases.Count; i++)
            {
                GroupPhase phase = model.AdditionalPhases[i];
                GroupPhaseVm phaseVm = new GroupPhaseVm(phase);
                additionalPhases.Add(phaseVm);
            }
        }

        public GroupPhaseVm CreateAdditionalPhase(Database context = null)
        {
            return GroupPhaseVm.CreateModelAndVmAndAddToLists(context ?? model.Reference.Context, model.AdditionalPhases, additionalPhases) as GroupPhaseVm;
        }
    }
}
