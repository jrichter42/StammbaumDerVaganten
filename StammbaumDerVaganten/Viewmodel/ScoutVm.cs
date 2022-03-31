using System;
using System.Collections.ObjectModel;

namespace StammbaumDerVaganten
{
    public class ScoutVm : ViewmodelOfReferenceable<Scout>
    {
        protected ObservableCollection<MembershipVm> memberships;
        protected ObservableCollection<ActivityVm> activities;

        public string Forename
        {
            get { return model.Forename.Latest; }
            set
            {
                if (model.Forename.Latest != value)
                {
                    model.Forename.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Lastname
        {
            get { return model.Lastname.Latest; }
            set
            {
                if (model.Lastname.Latest != value)
                {
                    model.Lastname.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Scoutname
        {
            get { return model.Scoutname.Latest; }
            set
            {
                if (model.Scoutname.Latest != value)
                {
                    model.Scoutname.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime Birthdate
        {
            get { return model.Birthdate.Latest; }
            set
            {
                if (model.Birthdate.Latest != value)
                {
                    model.Birthdate.Latest = new Date(value);
                    NotifyPropertyChanged();
                }
            }
        }

        public string ContactInfo
        {
            get { return model.ContactInfo.Latest; }
            set
            {
                if (model.ContactInfo.Latest != value)
                {
                    model.ContactInfo.Latest = value;
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

        public ObservableCollection<MembershipVm> Memberships
        {
            get { return memberships; }
            set
            {
                if (memberships != value)
                {
                    memberships = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<ActivityVm> Activities
        {
            get { return activities; }
            set
            {
                if (activities != value)
                {
                    activities = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ScoutVm()
        { }

        public ScoutVm(Scout scout)
            : base(scout)
        { }

        protected override void AfterSetModel()
        {
            base.AfterSetModel();

            memberships = new ObservableCollection<MembershipVm>();
            for (int i = 0; i < model.Memberships.Count; i++)
            {
                Membership membership = model.Memberships[i];
                MembershipVm membershipVm = new MembershipVm(membership);
                memberships.Add(membershipVm);
            }

            activities = new ObservableCollection<ActivityVm>();
            for (int i = 0; i < model.Activities.Count; i++)
            {
                ActivityVm activityVm = new ActivityVm(model.Activities[i]);
                activities.Add(activityVm);
            }
        }

        public ActivityVm CreateActivity(Database context = null)
        {
            return ActivityVm.CreateModelAndVmAndAddToLists(context ?? Model.Reference.Context, model.Activities, activities) as ActivityVm;
        }

        public MembershipVm CreateMembership(Database context = null)
        {
            return MembershipVm.CreateModelAndVmAndAddToLists(context ?? Model.Reference.Context, model.Memberships, memberships) as MembershipVm;
        }
    }
}
